const { Db } = require('mongodb');

/**
 * Prices repository
 *
 * plural used to define repositories name
 * errors are caught by using service
 */
class PricesRepository {

    /**
     *
     * @param db {Db}
     */
    constructor(db) {
        this.collection = db.collection('prices');
    }

    /**
     * @param currency {string}
     * @param prices {Object[]}
     * @return {Promise<InsertOneResult<TSchema>>}
     */
    async upsertPrices(currency, prices) {
        return this.collection.updateOne(
            { currency },
            { $push: { prices: { $each: prices } } },
            { upsert: true }
        );
    }

    /**
     * @param currency {string}
     * @return {Promise<WithId<TSchema> | null>}
     */
    async getPricesByCurrency(currency) {
        return this.collection.findOne({ currency });
    }
}

module.exports = PricesRepository;
