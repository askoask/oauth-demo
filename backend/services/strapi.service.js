import Stripe from 'stripe';
import { inspect } from 'node:util';

class StrapiService {
  static #instance;

  #stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  constructor() {
    if (StrapiService.#instance) {
      return StrapiService.#instance;
    }

    StrapiService.#instance = this;
  }

  /**
   * https://docs.stripe.com/testing
   */
  async makeTestPayment(productId, amount, stripeCustomerId, paymentMethodId) {
    const paymentIntent = await this.#stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        productId,
      },
    });
    console.log('paymentIntent', inspect(paymentIntent?.status || 'ERROR'));

    return paymentIntent?.status === 'succeeded';
  }

  async registerCustomers(users) {
    for await (const user of users) {
      const customer = await this.#stripe.customers.create({
        id: user.is,
        name: user.name,
        email: user.email,
      });
      console.log('Registered customer', inspect(customer));
      user.stripeCustomerId = customer.id;
    }
    console.log('users', JSON.stringify(users, null, 2));
  }

  async registerPaymentMethodToCustomers(users) {
    for await (const user of users) {
      const paymentMethod = await this.#stripe.paymentMethods.create({
        type: 'card',
        card: { token: 'tok_visa' },
      });
      console.log('Registered payment method', inspect(paymentMethod));

      const attachResponse = await this.#stripe.paymentMethods.attach(
        paymentMethod.id,
        {
          customer: user.stripeCustomerId,
        }
      );
      console.log('Attached payment method', inspect(attachResponse));

      user.paymentMethodId = paymentMethod.id;
    }
    console.log('users', JSON.stringify(users, null, 2));
  }

  // async registerCustomer(userId) {
  //   const customer = await this.#stripe.customers.create({
  //     description: "Mock user " + userId,
  //     metadata: {
  //       userId,
  //     },
  //   });
  //   console.log("customer", customer);

  //   const paymentMethod = await this.#stripe.paymentMethods.create({
  //     type: "card",
  //     card: {
  //       number: "4242424242424242",
  //       exp_month: 12,
  //       exp_year: 2030,
  //       cvc: "123",
  //     },
  //   });
  //   console.log("paymentMethod", paymentMethod);

  //   const attachResponse = await this.#stripe.paymentMethods.attach(
  //     paymentMethod.id,
  //     {
  //       customer: customer.id,
  //       default_payment_method: paymentMethod.id,
  //     }
  //   );
  //   console.log("attachResponse", attachResponse);

  //   console.log({
  //     customerId: customer.id,
  //     paymentMethodId: paymentMethod.id,
  //   });

  //   return {
  //     customerId: customer.id,
  //     paymentMethodId: paymentMethod.id,
  //   };
  // }
}
export default new StrapiService();
