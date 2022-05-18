const { sortByTimestamp, timestampToDate } = require('../helpers');

/**
 * Worker service
 */
class Worker {

    /**
     * @param wholeFolioService
     * @param pricesRepository
     */
    constructor(wholeFolioService, pricesRepository) {
        this.wholeFolioService = wholeFolioService;
        this.pricesRepository = pricesRepository;

        this.startDate = process.env.START_DATE;
    }

    /**
     * @return {number}
     * @private
     */
    _countHoursFromDate(fromDate) {
        const startDate = new Date(fromDate);
        startDate.setMinutes(120);
        const nowDate = this._roundToNearestHour(new Date(Date.now()));
        const timeDiff = nowDate.getTime() - startDate.getTime();

        return Math.floor((timeDiff / (1000 * 3600)));
    }

    /**
     * @param date {Date}
     * @param up {boolean}
     * @return {Date}
     * @private
     */
    _roundToNearestHour(date, up = false) {
        const minutes = up ? 60 : 0;

        return new Date(date.setMinutes(minutes, 0, 0));
    }

    /**
     * @param prices {Object[]}
     * @return {*}
     * @private
     */
    _clearLastNotRoundedPrice(prices) {
        const date = new Date(prices[prices.length - 1].timestamp);
        if (date.getMinutes() !== 0 && date.getSeconds() !== 0) {
            prices.pop();
        }

        return prices;
    }

    /**
     * @param currency {string}
     * @return {Promise<*>}
     * @private
     */
    async _fetchLatestDateFromDatabase(currency) {
        let latestDate;
        const prices = await this.pricesRepository.getPricesByCurrency(currency);

        if (prices && 'prices' in prices) {
            const sorted = sortByTimestamp(prices.prices, true);
            latestDate = sorted[sorted.length - 1]['timestamp'];
        }

        return latestDate;
    }

    /**
     * @param currency {string}
     * @param hours {number}
     * @return {Promise<void>}
     * @private
     */
    async _fetchAndUpdate(currency, hours) {
        let prices = await this.wholeFolioService.accumulatePrices(currency, hours);
        prices = this._clearLastNotRoundedPrice(prices);

        await this.pricesRepository.upsertPrices(currency, prices);
        console.log('prices from date fetched and inserted');
    }

    /**
     * @param currency {string}
     * @return {Promise<FlatArray<*[], 1>[]>}
     * @private
     */
    async _fetchFromDate(currency) {
        const latestDate = await this._fetchLatestDateFromDatabase(currency);
        if (latestDate) {
            const date = new Date(latestDate).setMinutes(60);
            this.startDate = timestampToDate(date);
        }

        const hoursFromDate = this._countHoursFromDate(this.startDate);
        if (hoursFromDate > 0) {
            console.log(`Started to fetch from date [${this.startDate}]`);
            await this._fetchAndUpdate(currency, hoursFromDate);
        }
    }

    /**
     * @param currency {string}
     * @return {Promise<void>}
     * @private
     */
    async _fetchRegular(currency) {
        let latestDate = await this._fetchLatestDateFromDatabase(currency);
        let date = new Date(latestDate).setMinutes(60);
        let fromDate = timestampToDate(date);
        const hoursFromDate = this._countHoursFromDate(fromDate);

        if (hoursFromDate > 0) {
            await this._fetchAndUpdate(currency, hoursFromDate);
        }

        console.log('starting regular fetching...');
        setInterval(async () => {
            console.log(`[${new Date(Date.now())}] regular fetching started...`);
            await this._fetchAndUpdate(currency, 1);
        }, 60000 * 60);
    }

    /**
     * @param currency {string}
     * @return {Promise<void>}
     */
    async start(currency) {
        await this._fetchFromDate(currency);
        await this._fetchRegular(currency);
    }
}

module.exports = Worker;