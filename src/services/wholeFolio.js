const axios = require('axios');
const {pauseFor} = require("../helpers");

/**
 * WholeFolio API interface
 */
class WholeFolio {

    /**
     * WholeFolio constructor
     */
    constructor() {
        this.url = process.env.WHOLEFOLIO_API;
        this.token = process.env.WHOLEFOLIO_TOKEN;
        this.options = {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        };

        this.maxReqPerMin = 100;
        this.maxReqPerHour = 1000;
        this.maxResPerReq = 100;

        this.exchangeId = 1; // Binance
        this.aggregate = '1h';
    }

    /**
     * @param currency {string}
     * @param timeStart {number}
     * @return {Promise<any>}
     */
    async getPrices(currency, timeStart) {
        try {
            const params = {};
            params.currency = currency;
            params.time_start = `${timeStart}h`;
            params.aggregate = this.aggregate;
            params.exchange_id = this.exchangeId;

            const options = Object.assign(this.options, { params })
            const response = await axios.get(`${this.url}/historical/fiat`, options);

            return response.data.results;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @param currency {string}
     * @param results {number}
     * @return {Promise<FlatArray<*[], 1>[]>}
     */
    async accumulatePrices(currency, results) {
        const requests = Math.ceil(results / this.maxResPerReq);

        const result = [];
        for (let i = 1; i <= requests; i++) {
            console.log(`request #${i} from accumulating data started...`);
            const response = await this.getPrices(currency, results);
            results = results - this.maxResPerReq;
            result.push(response);

            if (i % this.maxReqPerMin === 0) {
                console.log('pausing requests for a minute...');
                await pauseFor(60000);
            }
        }

        return result.flat();
    }
}

module.exports = WholeFolio;
