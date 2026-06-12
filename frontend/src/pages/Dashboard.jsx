import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react'
import useStore from '../store/useStore'
import StatsCard from '../components/shared/StatsCard'
import Badge from '../components/shared/Badge'
import TableSkeleton from '../components/shared/TableSkeleton'
import EmptyState from '../components/shared/EmptyState'

function getStockBadge(qty) {
  if (qty < 5)  return <Badge variant="danger">Critical</Badge>
  if (qty < 10) return <Badge variant="warning">Low Stock</Badge>
  return <Badge variant="success">In Stock</Badge>
}

export default function Dashboard() {
  const {
    products, productsLoading, fetchProducts,
    customers, customersLoading, fetchCustomers,
    orders, ordersLoading, fetchOrders,
  } = useStore()

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
    fetchOrders()
  }, [fetchProducts, fetchCustomers, fetchOrders])

  const loading = productsLoading || customersLoading || ordersLoading
  const lowStockProducts = products.filter((p) => p.stock_quantity < 10)

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Products"
          value={products.length}
          icon={Package}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          loading={productsLoading}
        />
        <StatsCard
          label="Total Customers"
          value={customers.length}
          icon={Users}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
          loading={customersLoading}
        />
        <StatsCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          loading={ordersLoading}
        />
        <StatsCard
          label="Low Stock Products"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          loading={productsLoading}
        />
      </div>

      {/* Low Stock Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Low Stock Products</h3>
            <p className="text-xs text-gray-500 mt-0.5">Products with fewer than 10 units remaining</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="sticky top-0 px-6 py-3">Product Name</th>
                <th className="sticky top-0 px-6 py-3">SKU</th>
                <th className="sticky top-0 px-6 py-3">Current Stock</th>
                <th className="sticky top-0 px-6 py-3">Status</th>
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={4} cols={4} />
            ) : (
              <tbody>
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        title="No low stock products"
                        description="All products have sufficient stock levels."
                      />
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={[
                        'border-t border-gray-100 transition-colors hover:bg-gray-50',
                        product.stock_quantity < 5 ? 'bg-red-50/40' : 'bg-amber-50/30',
                      ].join(' ')}
                    >
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-600">
                        {product.sku}
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        {product.stock_quantity}
                      </td>
                      <td className="px-6 py-3">
                        {getStockBadge(product.stock_quantity)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
