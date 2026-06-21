import {

  getSdkworkCommerceService,

  unwrapSdkworkCommerceResponse,

} from "@sdkwork/commerce-service";



export interface MallCartLine {

  id: string;

  imageUrl?: string;

  lineTotalCny: number | null;

  productId: string;

  quantity: number;

  shopName?: string;

  skuId: string;

  skuName?: string;

  title: string;

  unitPriceCny: number | null;

}



export interface MallCartSnapshot {

  id: string;

  items: MallCartLine[];

  totalAmountCny: number;

}



export interface MallCheckoutAddress {

  fullAddress: string;

  id: string;

  isDefault: boolean;

  name: string;

  phone?: string;

}



export interface MallCheckoutCoupon {

  id: string;

  title: string;

}



export interface MallCheckoutPaymentMethod {

  code: string;

  id: string;

  label: string;

}



export interface MallCheckoutContext {

  addresses: MallCheckoutAddress[];

  cart: MallCartSnapshot;

  coupons: MallCheckoutCoupon[];

  paymentMethods: MallCheckoutPaymentMethod[];

  pointsBalance: number;

  walletBalanceCny: number;

}



export interface MallCheckoutQuote {

  discountAmountCny: number;

  originalAmountCny: number;

  payableAmountCny: number;

  quoteId: string;

  sessionId: string;

}



export interface MallCheckoutInvoiceForm {
  titleType: "company" | "personal";
  title: string;
  taxNumber?: string;
  email?: string;
}

export interface MallCheckoutSubmitInput {
  addressId?: string;
  buyerRemark?: string;
  couponId?: string;
  deliveryMethod?: string;
  giftCardCode?: string;
  invoiceForm?: MallCheckoutInvoiceForm;
  needInvoice?: boolean;
  paymentMethodCode?: string;
  usePoints?: boolean;
  useWallet?: boolean;
}



export interface MallCheckoutSubmitResult {

  nextUrl: string;

  orderId: string;

  paymentId?: string;

}



function readMoney(value: unknown): number {

  if (typeof value === "number" && Number.isFinite(value)) {

    return value;

  }

  if (typeof value === "object" && value !== null && "amount" in value) {

    return readMoney((value as { amount?: unknown }).amount);

  }

  return 0;

}



function readCartLine(record: Record<string, unknown>): MallCartLine {

  const unitPrice =

    typeof record.unitPrice === "number"

      ? record.unitPrice

      : typeof record.price === "number"

        ? record.price

        : null;

  const quantity = typeof record.quantity === "number" ? record.quantity : 1;

  const imageSource =
    typeof record.imageUrl === "string" && record.imageUrl.length > 0
      ? record.imageUrl
      : typeof record.image === "string" && record.image.length > 0
        ? record.image
        : typeof record.thumbnail === "string" && record.thumbnail.length > 0
          ? record.thumbnail
          : typeof record.productImage === "string" && record.productImage.length > 0
            ? record.productImage
            : undefined;

  return {

    id: String(record.id ?? ""),

    productId: String(record.spuId ?? record.productId ?? ""),

    skuId: String(record.skuId ?? ""),

    title: String(record.title ?? record.productName ?? "商品"),

    skuName: typeof record.skuName === "string" ? record.skuName : undefined,

    shopName: typeof record.shopName === "string" ? record.shopName : undefined,

    imageUrl: imageSource,

    quantity,

    unitPriceCny: unitPrice,

    lineTotalCny: unitPrice != null ? unitPrice * quantity : null,

  };

}



function readSessionId(record: Record<string, unknown>): string {

  return String(record.checkoutSessionId ?? record.checkout_session_id ?? record.id ?? "");

}



function readQuoteId(record: Record<string, unknown>): string {

  return String(record.quoteId ?? record.quote_id ?? "");

}



function readOrderId(record: Record<string, unknown>): string {

  return String(record.id ?? record.orderId ?? record.order_id ?? "");

}



export async function loadMallCart(): Promise<MallCartSnapshot> {

  const service = getSdkworkCommerceService();

  const response = await service.cart.current.retrieve();

  const payload = unwrapSdkworkCommerceResponse(response) as Record<string, unknown>;

  const items = Array.isArray(payload.items)

    ? payload.items.map((item) => readCartLine(item as Record<string, unknown>))

    : [];

  const totalAmountCny = items.reduce((sum, item) => sum + (item.lineTotalCny ?? 0), 0);



  return {

    id: String(payload.id ?? "current"),

    items,

    totalAmountCny,

  };

}



export async function updateMallCartItem(cartItemId: string, quantity: number) {

  const service = getSdkworkCommerceService();

  return service.cart.items.update({ cartItemId, quantity });

}



export async function removeMallCartItem(cartItemId: string) {

  const service = getSdkworkCommerceService();

  return service.cart.items.delete({ cartItemId });

}



export async function loadMallCheckoutContext(): Promise<MallCheckoutContext> {

  const service = getSdkworkCommerceService();

  const [cart, addressesResult, couponsResult, methodsResult, walletResult, pointsResult] =

    await Promise.allSettled([

      loadMallCart(),

      service.addresses.list({ page: 1, page_size: 20 }),

      service.promotions.userCoupons.list({ status: "available", page: 1, page_size: 20 }),

      service.payments.methods.list({}),

      service.wallet.overview.retrieve(),

      service.wallet.accounts.points.retrieve(),

    ]);



  const addressesPayload =

    addressesResult.status === "fulfilled"

      ? (unwrapSdkworkCommerceResponse(addressesResult.value) as { items?: Record<string, unknown>[] })

      : { items: [] as Record<string, unknown>[] };



  const couponsPayload =

    couponsResult.status === "fulfilled"

      ? (unwrapSdkworkCommerceResponse(couponsResult.value) as { items?: Record<string, unknown>[] })

      : { items: [] as Record<string, unknown>[] };



  const methodsPayload =

    methodsResult.status === "fulfilled"

      ? (unwrapSdkworkCommerceResponse(methodsResult.value) as { items?: Record<string, unknown>[] })

      : { items: [] as Record<string, unknown>[] };



  const walletPayload =

    walletResult.status === "fulfilled"

      ? (unwrapSdkworkCommerceResponse(walletResult.value) as Record<string, unknown>)

      : {};



  const pointsPayload =

    pointsResult.status === "fulfilled"

      ? (unwrapSdkworkCommerceResponse(pointsResult.value) as Record<string, unknown>)

      : {};



  return {

    cart: cart.status === "fulfilled" ? cart.value : { id: "current", items: [], totalAmountCny: 0 },

    addresses:

      addressesPayload.items?.map((item) => ({

        id: String(item.id ?? ""),

        name: String(item.contactName ?? item.name ?? "收件人"),

        phone: typeof item.phone === "string" ? item.phone : undefined,

        fullAddress: [item.province, item.city, item.district, item.detail]

          .filter((part) => typeof part === "string" && part.length > 0)

          .join(" "),

        isDefault: Boolean(item.isDefault ?? item.default),

      })) ?? [],

    coupons:

      couponsPayload.items?.map((item) => ({

        id: String(item.id ?? ""),

        title: String(item.title ?? item.name ?? "优惠券"),

      })) ?? [],

    paymentMethods:

      methodsPayload.items?.map((item) => ({

        id: String(item.id ?? item.code ?? ""),

        code: String(item.code ?? item.id ?? ""),

        label: String(item.label ?? item.name ?? item.code ?? "支付方式"),

      })) ?? [],

    walletBalanceCny: readMoney(walletPayload.cashAvailable ?? walletPayload.availableBalance),

    pointsBalance: readMoney(pointsPayload.availablePoints ?? pointsPayload.totalPoints),

  };

}



export async function createMallCheckoutQuote(): Promise<MallCheckoutQuote> {

  const service = getSdkworkCommerceService();

  const sessionResponse = await service.checkout.sessions.create({});

  const session = unwrapSdkworkCommerceResponse(sessionResponse) as Record<string, unknown>;

  const sessionId = readSessionId(session);

  let quoteId = readQuoteId(session);



  if (!quoteId && sessionId) {

    const quoteResponse = await service.checkout.sessions.quotes.create(sessionId, {});

    const quote = unwrapSdkworkCommerceResponse(quoteResponse) as Record<string, unknown>;

    quoteId = readQuoteId(quote);

  }



  return {

    sessionId,

    quoteId,

    originalAmountCny: readMoney(session.originalAmount ?? session.original_amount),

    discountAmountCny: readMoney(session.discountAmount ?? session.discount_amount),

    payableAmountCny: readMoney(session.payableAmount ?? session.payable_amount),

  };

}



export async function submitMallCheckoutOrder(

  input: MallCheckoutSubmitInput,

): Promise<MallCheckoutSubmitResult> {

  const service = getSdkworkCommerceService();

  const quote = await createMallCheckoutQuote();



  if (input.addressId) {

    await service.addresses.defaultSelection.create({ addressId: input.addressId });

  }



  const orderResponse = await service.checkout.sessions.orders.create(quote.sessionId, {
    buyerRemark: input.buyerRemark,
    deliveryMethod: input.deliveryMethod,
    giftCardCode: input.giftCardCode,
    invoiceForm: input.invoiceForm,
    needInvoice: input.needInvoice,
    quoteId: quote.quoteId,
  });

  const order = unwrapSdkworkCommerceResponse(orderResponse) as Record<string, unknown>;

  const orderId = readOrderId(order);



  if (!orderId) {

    throw new Error("订单创建失败");

  }



  if (input.couponId) {

    await service.promotions.discountApplications.create({

      orderId,

      userCouponId: input.couponId,

    });

  }



  if (input.useWallet) {

    try {

      await service.wallet.holds.create({ orderId, assetType: "cash" });

    } catch {

      // Wallet deduction is optional when balance is insufficient.

    }

  }



  if (input.usePoints) {

    try {

      await service.wallet.holds.create({ orderId, assetType: "points" });

    } catch {

      // Points deduction is optional when balance is insufficient.

    }

  }



  let paymentId: string | undefined;

  let nextUrl = `/payment/result?status=success&orderId=${encodeURIComponent(orderId)}`;



  if (input.paymentMethodCode) {

    const paymentResponse = await service.orders.pay(orderId, {

      paymentMethod: input.paymentMethodCode,

    });

    const payment = unwrapSdkworkCommerceResponse(paymentResponse) as Record<string, unknown>;

    paymentId = String(payment.paymentId ?? payment.payment_id ?? payment.id ?? "");

    if (paymentId) {

      nextUrl = `/payment/result?status=pending&orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}`;

    }

  }



  return { orderId, paymentId, nextUrl };

}


