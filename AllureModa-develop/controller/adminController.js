const { prisma } = require('../prisma/client');

async function getAdminStatsController(req, res) {
  try {
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

    const [users, products, orders, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
    ]);

    const dailyUsers = await prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyOrders = await prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { createdAt: 'asc' },
    });

    const top = await prisma.orderItem.groupBy({
      by: ['productVariantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 6,
    });
    const variantIds = top.map(function(t){ return t.productVariantId; });
    const variants = variantIds.length ? await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { include: { category: true } } },
    }) : [];
    const topProducts = variants.map(function(v){ return v.product; });

    function formatDailyData(data, valueField, countField) {
      const result = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(new Date().setDate(new Date().getDate() - i));
        result[d.toISOString().split('T')[0]] = 0;
      }
      data.forEach(function(d){
        const date = d.createdAt.toISOString().split('T')[0];
        result[date] = valueField ? d._sum[valueField] : d._count[countField];
      });
      return Object.entries(result)
        .sort(function([d1],[d2]){ return new Date(d1) > new Date(d2) ? 1 : -1; })
        .reduce(function(acc,[d,v]){ acc[d]=v; return acc; },{});
    }

    res.status(200).json({
      users,
      products,
      orders,
      revenue: revenueAgg._sum.totalPrice,
      topProducts,
      charts: {
        users: formatDailyData(dailyUsers, null, 'id'),
        orders: formatDailyData(dailyOrders, null, 'id'),
        revenue: formatDailyData(dailyOrders, 'totalPrice', null),
      },
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
}

async function listUsersController(req, res) {
  try {
    const users = await prisma.user.findMany({ select: { id:true, firstName:true, lastName:true, email:true, role:true, createdAt:true } });
    res.status(200).json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
}

async function listOrdersController(req, res) {
  try {
    const orders = await prisma.order.findMany({ include: { user: { select: { firstName:true, lastName:true } }, items: true } });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
}

module.exports = { getAdminStatsController, listUsersController, listOrdersController };
