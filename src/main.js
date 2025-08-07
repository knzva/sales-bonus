/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  const baseAmount = purchase.sale_price * purchase.quantity;
  const discountAmount = (baseAmount * (purchase.discount || 0)) / 100;
  const revenue = baseAmount - discountAmount;

  return Math.round(revenue * 100) / 100;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  if (index === 0) {
    return Math.round(seller.profit * 0.15);
  } else if (index === 1 || index === 2) {
    return Math.round(seller.profit * 0.1);
  } else if (index === total - 1) {
    return 0;
  } else {
    return Math.round(seller.profit * 0.05);
  }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // Проверка входных данных
  if (!data || typeof data !== "object") {
    throw new Error("Некорректные входные данные");
  }

  if (!data.sellers || !Array.isArray(data.sellers)) {
    throw new Error("Отсутствуют данные о продавцах");
  }

  if (!data.products || !Array.isArray(data.products)) {
    throw new Error("Отсутствуют данные о товарах");
  }

  if (!data.purchase_records || !Array.isArray(data.purchase_records)) {
    throw new Error("Отсутствуют данные о покупках (purchase_records)");
  }

  // Проверка наличия опций
  if (!options || typeof options !== "object") {
    throw new Error("Отсутствуют опции");
  }

  if (typeof options.calculateRevenue !== "function") {
    throw new Error("Отсутствует функция расчета выручки");
  }

  if (typeof options.calculateBonus !== "function") {
    throw new Error("Отсутствует функция расчета бонуса");
  }

  // Подготовка промежуточных данных для сбора статистики
  const sellersStats = {};

  // Индексация продавцов и товаров для быстрого доступа
  const sellerIndex = {};
  const productIndex = {};

  // Создание индексов продавцов
  data.sellers.forEach((seller) => {
    const sellerId = seller.id;
    const sellerName = `${seller.first_name} ${seller.last_name}`;

    sellerIndex[sellerId] = seller;
    sellersStats[sellerId] = {
      seller_id: sellerId,
      name: sellerName,
      revenue: 0,
      profit: 0,
      sales_count: 0,
      products: {},
      top_products: [],
      bonus: 0,
    };
  });

  // Создание индексов товаров
  data.products.forEach((product) => {
    productIndex[product.sku] = product;
  });

  // Расчет выручки и прибыли для каждого продавца
  data.purchase_records.forEach((record) => {
    const sellerId = record.seller_id;

    if (!sellersStats[sellerId]) {
      console.warn(`Продавец ${sellerId} не найден в списке продавцов`);
      return;
    }

    // Увеличиваем количество продаж (количество чеков)
    sellersStats[sellerId].sales_count += 1;

    // Проходим по всем товарам в чеке
    record.items.forEach((item) => {
      const product = productIndex[item.sku];

      if (!product) {
        console.warn(`Товар ${item.sku} не найден в каталоге`);
        return;
      }

      // Считаем выручку через переданную функцию
      const revenue = options.calculateRevenue(item, product);
      sellersStats[sellerId].revenue += revenue;

      // Считаем прибыль (выручка минус себестоимость)
      const cost = product.purchase_price * item.quantity;
      const profit = revenue - cost;
      sellersStats[sellerId].profit += profit;

      // Учитываем проданные товары для топ-10
      if (!sellersStats[sellerId].products[item.sku]) {
        sellersStats[sellerId].products[item.sku] = 0;
      }
      sellersStats[sellerId].products[item.sku] += item.quantity;
    });
  });

  // Подготовка топ-10 товаров для каждого продавца
  Object.keys(sellersStats).forEach((sellerId) => {
    const seller = sellersStats[sellerId];
    const productsArray = Object.entries(seller.products)
      .map(([sku, quantity]) => ({ sku, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    seller.top_products = productsArray;
    delete seller.products; // Удаляем временный объект
  });

  // Сортировка продавцов по прибыли (по убыванию)
  const sortedSellers = Object.values(sellersStats).sort(
    (a, b) => b.profit - a.profit
  );

  // Назначение премий на основе ранжирования
  sortedSellers.forEach((seller, index) => {
    seller.bonus = options.calculateBonus(index, sortedSellers.length, seller);
  });

  // Подготовка итоговой коллекции с нужными полями
  const result = sortedSellers.map((seller) => ({
    seller_id: seller.seller_id,
    name: seller.name,
    revenue: Math.round(seller.revenue * 100) / 100,
    profit: Math.round(seller.profit * 100) / 100,
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: Math.round(seller.bonus),
  }));

  return result;
}
