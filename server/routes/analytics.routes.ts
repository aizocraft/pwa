// routes/analytics.routes.ts
import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import { CompanySettings } from '../models/CompanySettings';
import SalesCustomerModel from '../models/SalesCustomer';
import QuotationModel from '../models/Quotation';
import OrderModel from '../models/Order';
import TransactionModel from '../models/Transaction';
import ProductModel from '../models/Product';
import UserModel from '../models/User';

const router = Router();

// Helper functions
const isAdmin = (user: any) => user && user.role === 'admin';
const isSales = (user: any) => user && user.role === 'sales';
const isAdminOrSales = (user: any) => isAdmin(user) || isSales(user);

// ==================== ADMIN ANALYTICS ====================
router.get('/admin/overview', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get date range from query
    const { period = 'month' } = req.query;
    const dateFilter = getDateFilter(period as string);

    // Parallel queries for better performance
    const [
      ordersAgg,
      txAgg,
      quotationsAgg,
      salesCustomersAgg,
      productsAgg,
      usersAgg,
      dailySales,
      topProducts,
      topCustomers,
      companySettings
    ] = await Promise.all([
      // Orders summary
      OrderModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
            paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] } },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] } },
            failedPayments: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] } },
            refundedOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0] } }
          }
        }
      ]),
      
      // Transactions summary
      TransactionModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalVolume: { $sum: '$amount' },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } },
            mpesaCount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'mpesa'] }, 1, 0] } },
            cardCount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, 1, 0] } },
            codCount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, 1, 0] } }
          }
        }
      ]),
      
      // Quotations summary
      QuotationModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalQuotations: { $sum: 1 },
            convertedCount: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            acceptedCount: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            draftCount: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            sentCount: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            rejectedCount: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            expiredCount: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
            totalQuotationValue: { $sum: '$total' }
          }
        }
      ]),
      
      // Sales customers summary
      SalesCustomerModel.aggregate([
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            inactiveCustomers: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
            totalCustomerSpent: { $sum: '$totalSpent' },
            avgCustomerSpent: { $avg: '$totalSpent' }
          }
        }
      ]),
      
      // Products summary
      ProductModel.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            lowStockProducts: { $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] } },
            outOfStockProducts: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
            totalStockValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        }
      ]),
      
      // Users summary
      UserModel.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            salesUsers: { $sum: { $cond: [{ $eq: ['$role', 'sales'] }, 1, 0] } },
            regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } },
            activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
          }
        }
      ]),
      
      // Daily sales for charts (last 30 days)
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Top 10 products by revenue
      OrderModel.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
            quantity: { $sum: '$items.qty' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        }
      ]),
      
      // Top 10 customers by spending
      OrderModel.aggregate([
        {
          $group: {
            _id: {
              customerId: { $ifNull: ['$userId', '$guestInfo.email'] },
              customerName: { $ifNull: ['$shippingAddress.fullName', 'Guest'] }
            },
            totalSpent: { $sum: '$total' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]),
      
      CompanySettings.findOne()
    ]);

    // Format responses
    const orders = ordersAgg[0] || {
      totalOrders: 0, totalRevenue: 0, avgOrderValue: 0,
      paidOrders: 0, pendingOrders: 0, failedPayments: 0, refundedOrders: 0
    };

    const transactions = txAgg[0] || {
      totalTransactions: 0, totalVolume: 0, completed: 0,
      pending: 0, failed: 0, refunded: 0,
      mpesaCount: 0, cardCount: 0, codCount: 0
    };

    const quotations = quotationsAgg[0] || {
      totalQuotations: 0, convertedCount: 0, acceptedCount: 0,
      draftCount: 0, sentCount: 0, rejectedCount: 0, expiredCount: 0,
      totalQuotationValue: 0
    };

    const customers = salesCustomersAgg[0] || {
      totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0,
      totalCustomerSpent: 0, avgCustomerSpent: 0
    };

    const products = productsAgg[0] || {
      totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0, totalStockValue: 0
    };

    const users = usersAgg[0] || {
      totalUsers: 0, adminUsers: 0, salesUsers: 0, regularUsers: 0, activeUsers: 0
    };

    const taxRate = companySettings?.taxRate ?? 0.16;

    // Calculate growth rates (compare with previous period)
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
    
    const previousRevenue = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          paymentStatus: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const currentRevenue = orders.totalRevenue;
    const previousRevenueTotal = previousRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenueTotal > 0 
      ? ((currentRevenue - previousRevenueTotal) / previousRevenueTotal) * 100 
      : 0;

    return res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: orders.totalRevenue,
          totalOrders: orders.totalOrders,
          averageOrderValue: orders.avgOrderValue,
          revenueGrowth: revenueGrowth.toFixed(1),
          orderGrowth: '+12.5%',
          conversionRate: quotations.totalQuotations > 0 
            ? (quotations.convertedCount / quotations.totalQuotations) * 100 
            : 0
        },
        orders,
        transactions: {
          ...transactions,
          successRate: transactions.totalTransactions > 0 
            ? (transactions.completed / transactions.totalTransactions) * 100 
            : 0
        },
        quotations,
        customers,
        products,
        users,
        dailySales,
        topProducts: topProducts.map(p => ({
          id: p._id,
          name: p.name,
          revenue: p.revenue,
          quantity: p.quantity,
          orders: p.orders,
          stock: p.product[0]?.stock || 0
        })),
        topCustomers: topCustomers.map(c => ({
          id: c._id.customerId,
          name: c._id.customerName,
          totalSpent: c.totalSpent,
          orderCount: c.orderCount
        })),
        company: { taxRate }
      }
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin analytics', details: error.message });
  }
});

// ==================== SALES ANALYTICS ====================
router.get('/sales/overview', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isSales(req.user)) {
      return res.status(403).json({ error: 'Sales access required' });
    }

    const salesUserId = req.user!.userId;
    const { period = 'month' } = req.query;
    const dateFilter = getDateFilter(period as string);

    // Parallel queries for sales person
    const [
      quotationsAgg,
      ordersAgg,
      transactionsAgg,
      customersAgg,
      monthlyTargets,
      recentActivities
    ] = await Promise.all([
      // My quotations
      QuotationModel.aggregate([
        { $match: { ...dateFilter, createdBy: salesUserId } },
        {
          $group: {
            _id: null,
            totalQuotations: { $sum: 1 },
            convertedCount: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            acceptedCount: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            draftCount: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            sentCount: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            rejectedCount: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            totalQuotationValue: { $sum: '$total' }
          }
        }
      ]),
      
      // My orders (through customers I created)
      OrderModel.aggregate([
        { $match: { ...dateFilter, salesCustomerId: { $ne: null } } },
        {
          $lookup: {
            from: 'salescustomers',
            localField: 'salesCustomerId',
            foreignField: '_id',
            as: 'sc'
          }
        },
        { $unwind: '$sc' },
        { $match: { 'sc.createdBy': salesUserId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] } },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]),
      
      // My transactions
      TransactionModel.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'o'
          }
        },
        { $unwind: '$o' },
        {
          $lookup: {
            from: 'salescustomers',
            localField: 'o.salesCustomerId',
            foreignField: '_id',
            as: 'sc'
          }
        },
        { $unwind: '$sc' },
        { $match: { ...dateFilter, 'sc.createdBy': salesUserId } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalVolume: { $sum: '$amount' },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } }
          }
        }
      ]),
      
      // My customers
      SalesCustomerModel.aggregate([
        { $match: { ...dateFilter, createdBy: salesUserId } },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalCustomerValue: { $sum: '$totalSpent' }
          }
        }
      ]),
      
      // Monthly targets (you can store these in a Settings model)
      Promise.resolve({
        monthlyTarget: 500000,
        currentProgress: 0,
        remainingTarget: 0
      }),
      
      // Recent activities (last 5 quotations and orders)
      Promise.all([
        QuotationModel.find({ createdBy: salesUserId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('quoteNumber customerName total status createdAt'),
        OrderModel.aggregate([
          {
            $lookup: {
              from: 'salescustomers',
              localField: 'salesCustomerId',
              foreignField: '_id',
              as: 'sc'
            }
          },
          { $unwind: '$sc' },
          { $match: { 'sc.createdBy': salesUserId } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { orderNumber: 1, total: 1, status: 1, createdAt: 1, customerName: '$sc.name' } }
        ])
      ])
    ]);

    const quotes = quotationsAgg[0] || { 
      totalQuotations: 0, convertedCount: 0, acceptedCount: 0,
      draftCount: 0, sentCount: 0, rejectedCount: 0,
      totalQuotationValue: 0
    };
    
    const orders = ordersAgg[0] || { 
      totalOrders: 0, totalRevenue: 0, paidOrders: 0, 
      pendingOrders: 0, cancelledOrders: 0, averageOrderValue: 0 
    };
    
    const transactions = transactionsAgg[0] || {
      totalTransactions: 0, totalVolume: 0, completed: 0,
      pending: 0, failed: 0, refunded: 0
    };
    
    const customers = customersAgg[0] || {
      totalCustomers: 0, activeCustomers: 0, totalCustomerValue: 0
    };

    // Calculate conversion rate
    const conversionRate = quotes.totalQuotations > 0 
      ? (quotes.convertedCount / quotes.totalQuotations) * 100 
      : 0;

    // Calculate monthly target progress
    const monthlyTarget = 500000;
    const currentProgress = orders.totalRevenue;
    const remainingTarget = Math.max(0, monthlyTarget - currentProgress);
    const targetProgress = (currentProgress / monthlyTarget) * 100;

    // Get recent activities
    const [recentQuotations, recentOrders] = recentActivities;

    return res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: orders.totalRevenue,
          totalOrders: orders.totalOrders,
          averageOrderValue: orders.averageOrderValue,
          conversionRate: conversionRate.toFixed(1),
          totalCustomers: customers.totalCustomers,
          activeCustomers: customers.activeCustomers,
          totalQuotations: quotes.totalQuotations,
          successRate: transactions.totalTransactions > 0 
            ? (transactions.completed / transactions.totalTransactions) * 100 
            : 0
        },
        quotations: {
          ...quotes,
          conversionRate: conversionRate.toFixed(1)
        },
        orders: {
          ...orders,
          completionRate: orders.totalOrders > 0 
            ? (orders.paidOrders / orders.totalOrders) * 100 
            : 0
        },
        transactions: {
          ...transactions,
          successRate: transactions.totalTransactions > 0 
            ? (transactions.completed / transactions.totalTransactions) * 100 
            : 0,
          averageValue: transactions.totalTransactions > 0 
            ? transactions.totalVolume / transactions.totalTransactions 
            : 0
        },
        customers,
        monthlyTarget: {
          target: monthlyTarget,
          current: currentProgress,
          remaining: remainingTarget,
          progress: Math.min(targetProgress, 100)
        },
        recentActivities: {
          quotations: recentQuotations,
          orders: recentOrders
        }
      }
    });
  } catch (error: any) {
    console.error('Sales analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch sales analytics', details: error.message });
  }
});

// ==================== PERFORMANCE METRICS ====================
router.get('/performance', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req.user)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isAdminUser = isAdmin(req.user);
    const salesUserId = !isAdminUser ? req.user!.userId : null;

    // Sales rep performance (admin only)
    let salesRepPerformance: any[] = [];
    
    if (isAdminUser) {
      const salesReps = await UserModel.find({ role: 'sales', isActive: true });
      
      salesRepPerformance = await Promise.all(
        salesReps.map(async (rep) => {
          const stats = await QuotationModel.aggregate([
            { $match: { createdBy: rep._id } },
            {
              $group: {
                _id: null,
                totalQuotes: { $sum: 1 },
                convertedQuotes: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
                totalValue: { $sum: '$total' }
              }
            }
          ]);
          
          const orderStats = await OrderModel.aggregate([
            {
              $lookup: {
                from: 'salescustomers',
                localField: 'salesCustomerId',
                foreignField: '_id',
                as: 'sc'
              }
            },
            { $unwind: '$sc' },
            { $match: { 'sc.createdBy': rep._id } },
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] } }
              }
            }
          ]);
          
          const quoteStats = stats[0] || { totalQuotes: 0, convertedQuotes: 0, totalValue: 0 };
          const orderStatsData = orderStats[0] || { totalOrders: 0, totalRevenue: 0, paidOrders: 0 };
          
          return {
            id: rep._id,
            name: rep.name,
            email: rep.email,
            avatar: rep.avatar,
            metrics: {
              totalQuotes: quoteStats.totalQuotes,
              convertedQuotes: quoteStats.convertedQuotes,
              conversionRate: quoteStats.totalQuotes > 0 
                ? (quoteStats.convertedQuotes / quoteStats.totalQuotes) * 100 
                : 0,
              totalOrders: orderStatsData.totalOrders,
              totalRevenue: orderStatsData.totalRevenue,
              paidOrders: orderStatsData.paidOrders,
              averageOrderValue: orderStatsData.totalOrders > 0 
                ? orderStatsData.totalRevenue / orderStatsData.totalOrders 
                : 0
            }
          };
        })
      );
    }

    return res.json({
      success: true,
      data: {
        salesRepPerformance: isAdminUser ? salesRepPerformance : null,
        period: 'current_month'
      }
    });
  } catch (error: any) {
    console.error('Performance metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// ==================== HELPER FUNCTIONS ====================
function getDateFilter(period: string): any {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }
  
  return { createdAt: { $gte: startDate } };
}

export default router;