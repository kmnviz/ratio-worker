require('dotenv').config();

const { MongoClient } = require('mongodb');

const WholeFolioService = require('./services/wholeFolio');
const WorkerService = require('./services/worker');
const PricesRepository = require('./repositories/pricesRepository');

(async () => {
    console.log('--- Starting...');
    const mongoClient = new MongoClient(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`);
    await mongoClient.connect();
    console.log('--- Database connected');

    const mongoDb = mongoClient.db(process.env.MONGODB_DATABASE);

    const currency = process.argv[2];

    if (!currency) {
        console.log('............................');
        console.log(`You have to pass currency parameter!`);
        process.exit(1);
    }

    const wholeFolioService = new WholeFolioService();
    const pricesRepository = new PricesRepository(mongoDb);
    const workerService = new WorkerService(wholeFolioService, pricesRepository);

    console.log(`Worker start with ${currency}`);
    await workerService.start(currency);
})();
