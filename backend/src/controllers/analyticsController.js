import Payment from "../models/Payment.js"
import Lease from "../models/Lease.js"
import Invoice from "../models/Invoice.js"
import PaymentDispute from "../models/PaymentDispute.js"
import Property from "../models/Property.js"

export async function getDashboardMetrics(req, res) {
  try {
    const userRole = req.user.role
    const userId = req.user._id

    if (!["PM", "ADMIN", "FS", "GM"].includes(userRole)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const analyticsScope = await getAnalyticsScope(userRole, userId)

    const metrics = {
      revenue: {
        thisMonth: await getMonthlyRevenue(startOfMonth, analyticsScope),
        thisYear: await getYearlyRevenue(startOfYear, analyticsScope),
        total: await getTotalRevenue(analyticsScope),
      },
      payments: {
        pending: await getPaymentCount({ status: "PENDING" }, analyticsScope),
        verified: await getPaymentCount({ status: "VERIFIED" }, analyticsScope),
        failed: await getPaymentCount({ status: "FAILED" }, analyticsScope),
        avgVerificationTime: await getAvgVerificationTime(analyticsScope),
      },
      leases: {
        active: await getLeaseCount({ status: "ACTIVE" }, analyticsScope),
        terminated: await getLeaseCount({ status: "TERMINATED" }, analyticsScope),
        pending: await getLeaseCount({ status: "PENDING" }, analyticsScope),
      },
      disputes: {
        open: await getDisputeCount({ status: "OPEN" }, analyticsScope),
        resolved: await getDisputeCount({ status: "RESOLVED" }, analyticsScope),
        avgResolutionTime: await getAvgDisputeResolutionTime(analyticsScope),
      },
      collectionRate: await getCollectionRate(analyticsScope),
      overdueAmount: await getOverdueAmount(analyticsScope),
    }

    res.json({ status: 200, data: metrics })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getPaymentTrendChart(req, res) {
  try {
    const { months = 12 } = req.query
    const userRole = req.user.role
    const userId = req.user._id
    const analyticsScope = await getAnalyticsScope(userRole, userId)

    const monthCount = Math.min(24, Math.max(1, Number.parseInt(months, 10) || 12))

    const data = []
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const match = {
        status: "VERIFIED",
        verifiedAt: { $gte: startOfMonth, $lte: endOfMonth },
        ...analyticsScope.paymentMatch,
      }

      const revenue = await Payment.aggregate([
        {
          $match: match,
        },
        { $group: { _id: null, total: { $sum: "$amountEtb" } } },
      ])

      data.push({
        month: startOfMonth.toLocaleString("default", { month: "short", year: "numeric" }),
        revenue: revenue[0]?.total || 0,
      })
    }

    res.json({ status: 200, data })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getPaymentMethodBreakdown(req, res) {
  try {
    const userRole = req.user.role
    const userId = req.user._id
    const analyticsScope = await getAnalyticsScope(userRole, userId)

    const breakdown = await Payment.aggregate([
      { $match: { status: "VERIFIED", ...analyticsScope.paymentMatch } },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$amountEtb" } } },
    ])

    res.json({ status: 200, data: breakdown })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

export async function getPropertyPerformance(req, res) {
  try {
    const { propertyId, page = 1, limit = 20 } = req.query
    const userRole = req.user.role
    const userId = req.user._id

    const analyticsScope = await getAnalyticsScope(userRole, userId)

    const pageNumber = Number.parseInt(page, 10) || 1
    const limitNumber = Number.parseInt(limit, 10) || 20

    const query = { propertyId: propertyId ? { $eq: propertyId } : { $exists: true }, ...analyticsScope.leaseMatch }

    const properties = await Lease.aggregate([
      { $match: { isDeleted: false, status: "ACTIVE", ...query } },
      {
        $lookup: {
          from: "properties",
          localField: "propertyId",
          foreignField: "_id",
          as: "property",
        },
      },
      {
        $group: {
          _id: "$propertyId",
          leases: { $sum: 1 },
          totalMonthlyRent: { $sum: "$monthlyRentEtb" },
          property: { $first: "$property" },
        },
      },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
    ])

    for (const prop of properties) {
      const leaseIds = await Lease.find(
        { propertyId: prop._id, isDeleted: false, ...analyticsScope.leaseMatch },
        { _id: 1 },
      )

      const leaseIdList = leaseIds.map((lease) => lease._id)
      if (!leaseIdList.length) {
        prop.collectionRate = 0
        continue
      }

      const collected = await Payment.aggregate([
        { $match: { status: "VERIFIED", leaseId: { $in: leaseIdList }, ...analyticsScope.paymentMatch } },
        { $group: { _id: null, total: { $sum: "$amountEtb" } } },
      ])

      prop.collectionRate = collected[0]?.total
        ? Math.round((collected[0].total / (prop.totalMonthlyRent * 12)) * 100)
        : 0
    }

    res.json({ status: 200, data: properties })
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message })
  }
}

async function getMonthlyRevenue(startDate, scope) {
  const result = await Payment.aggregate([
    {
      $match: {
        status: "VERIFIED",
        verifiedAt: { $gte: startDate },
        ...scope.paymentMatch,
      },
    },
    { $group: { _id: null, total: { $sum: "$amountEtb" } } },
  ])

  return result[0]?.total || 0
}

async function getYearlyRevenue(startDate, scope) {
  const result = await Payment.aggregate([
    {
      $match: {
        status: "VERIFIED",
        verifiedAt: { $gte: startDate },
        ...scope.paymentMatch,
      },
    },
    { $group: { _id: null, total: { $sum: "$amountEtb" } } },
  ])

  return result[0]?.total || 0
}

async function getTotalRevenue(scope) {
  const result = await Payment.aggregate([
    { $match: { status: "VERIFIED", ...scope.paymentMatch } },
    { $group: { _id: null, total: { $sum: "$amountEtb" } } },
  ])

  return result[0]?.total || 0
}

async function getPaymentCount(query, scope) {
  return await Payment.countDocuments({ ...query, ...scope.paymentMatch, isDeleted: false })
}

async function getLeaseCount(query, scope) {
  return await Lease.countDocuments({ ...query, ...scope.leaseMatch, isDeleted: false })
}

async function getDisputeCount(query, scope) {
  if (!scope.paymentMatch.leaseId) {
    return await PaymentDispute.countDocuments({ ...query, isDeleted: false })
  }

  const leases = scope.paymentMatch.leaseId.$in || []
  return await PaymentDispute.countDocuments({ ...query, leaseId: { $in: leases }, isDeleted: false })
}

async function getAvgVerificationTime(scope) {
  const payments = await Payment.aggregate([
    {
      $match: { status: "VERIFIED", verifiedAt: { $exists: true }, ...scope.paymentMatch },
    },
    {
      $project: {
        verificationTime: { $subtract: ["$verifiedAt", "$createdAt"] },
      },
    },
    { $group: { _id: null, avg: { $avg: "$verificationTime" } } },
  ])

  return payments[0]?.avg ? Math.round(payments[0].avg / (1000 * 60)) : 0
}

async function getAvgDisputeResolutionTime(scope) {
  if (scope.leaseMatch.propertyId) {
    const leases = await Lease.find(scope.leaseMatch, { _id: 1 })
    const leaseIds = leases.map((l) => l._id)

    const disputes = await PaymentDispute.aggregate([
      {
        $match: { status: "RESOLVED", resolvedAt: { $exists: true }, leaseId: { $in: leaseIds } },
      },
      {
        $project: {
          resolutionTime: { $subtract: ["$resolvedAt", "$createdAt"] },
        },
      },
      { $group: { _id: null, avg: { $avg: "$resolutionTime" } } },
    ])

    return disputes[0]?.avg ? Math.round(disputes[0].avg / (1000 * 60 * 60 * 24)) : 0
  }

  const disputes = await PaymentDispute.aggregate([
    {
      $match: { status: "RESOLVED", resolvedAt: { $exists: true } },
    },
    {
      $project: {
        resolutionTime: { $subtract: ["$resolvedAt", "$createdAt"] },
      },
    },
    { $group: { _id: null, avg: { $avg: "$resolutionTime" } } },
  ])

  return disputes[0]?.avg ? Math.round(disputes[0].avg / (1000 * 60 * 60 * 24)) : 0
}

async function getCollectionRate(scope) {
  const leases = await Lease.countDocuments({ status: "ACTIVE", isDeleted: false, ...scope.leaseMatch })
  if (leases === 0) return 0

  const withPayments = await Payment.distinct("leaseId", { status: "VERIFIED", ...scope.paymentMatch })
  return Math.round((withPayments.length / leases) * 100)
}

async function getOverdueAmount(scope) {
  const now = new Date()
  const invoices = await Invoice.find({
    dueDate: { $lt: now },
    status: { $ne: "PAID" },
    ...scope.invoiceMatch,
  })

  return invoices.reduce((sum, inv) => sum + (inv.amountEtb - inv.paidAmount), 0)
}

async function getAnalyticsScope(userRole, userId) {
  if (userRole !== "PM") {
    return { leaseMatch: {}, paymentMatch: {}, invoiceMatch: {} }
  }

  const properties = await Property.find({ managerId: userId, isDeleted: false }, { _id: 1 })
  const leases = await Lease.find({ propertyId: { $in: properties.map((p) => p._id) } }, { _id: 1 })
  const leaseIds = leases.map((l) => l._id)

  return {
    leaseMatch: { propertyId: { $in: properties.map((p) => p._id) } },
    paymentMatch: { leaseId: { $in: leaseIds } },
    invoiceMatch: { leaseId: { $in: leaseIds } },
  }
}
