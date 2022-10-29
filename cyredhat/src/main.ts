import { PrismaClient } from '@prisma/client';
import { deepEqual, equal } from 'assert';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname,time',
    },
  },
});

enum OrderStatus {
  PROCESSING = 'PROCESSING',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
}

const PRODUCT_A_ID = 'PRODUCT_A_ID';
const PRODUCT_B_ID = 'PRODUCT_B_ID';
const PRODUCT_C_ID = 'PRODUCT_C_ID';
const PRODUCT_D_ID = 'PRODUCT_D_ID';
const PRODUCT_E_ID = 'PRODUCT_E_ID';
const PRODUCT_F_ID = 'PRODUCT_F_ID';

const prismaClient = new PrismaClient();

async function main() {
  try {
    const deliveredCount = await prismaClient.order.count({ where: { status: OrderStatus.DELIVERED } });

    equal(deliveredCount, 5);

    const processingCount = await prismaClient.order.count({ where: { status: OrderStatus.PROCESSING } });

    equal(processingCount, 1);

    const deliveredOrdersCountThatContainProductA =
      await prismaClient.order.count({ where: { status: OrderStatus.DELIVERED, orderItems: {
        some: {
          productId: PRODUCT_A_ID
        }
      } } });

    equal(deliveredOrdersCountThatContainProductA, 4);

    const productsThatPriceGreaterThanThirty = await prismaClient.product.findMany({
      where: {
        price: {
          gt: 30
        }
      }
    });

    deepEqual(productsThatPriceGreaterThanThirty, [
      { id: 'PRODUCT_D_ID', name: 'PRODUCT_D_NAME', price: 40 },
      { id: 'PRODUCT_F_ID', name: 'PRODUCT_F_NAME', price: 90 },
    ]);

    const productsNameThatPriceLessThanOrEqualThirty =
      await prismaClient.product.findMany({
        where: {
          price: {
            lte: 30,
          }
        },
        select: {
          name: true,
        }
      });

    deepEqual(productsNameThatPriceLessThanOrEqualThirty, [
      { name: 'PRODUCT_A_NAME' },
      { name: 'PRODUCT_B_NAME' },
      { name: 'PRODUCT_C_NAME' },
      { name: 'PRODUCT_E_NAME' },
    ]);

    logger.info('🙌 Please create PR 🙌');
    logger.info('🎉 Please ask speaker for a sticker 🎉');
  } catch (error) {
    console.log(error);
    logger.error('😱 Please try again 😱');
    logger.trace(
      '😱 Please ask speaker if you have some questions 😱'
    );
  }
}

main();