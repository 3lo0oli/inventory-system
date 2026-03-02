import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiArrowRight, FiPrinter, FiRotateCcw } from 'react-icons/fi';

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInvoice(); }, [id]);

  const loadInvoice = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
    } catch (err) {
      toast.error('خطأ في تحميل الفاتورة');
    } finally { setLoading(false); }
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="text-center py-10 text-gray-400">جاري التحميل...</div>;
  if (!invoice) return <div className="text-center py-10 text-gray-400">الفاتورة غير موجودة</div>;

  const paymentMap = { CASH: 'نقدي', CARD: 'بطاقة', TRANSFER: 'تحويل', MIXED: 'مختلط' };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3 no-print">
        <Link to="/invoices" className="text-primary-600 hover:text-primary-800"><FiArrowRight size={20} /></Link>
        <h1 className="text-2xl font-bold flex-1">تفاصيل الفاتورة</h1>
        <button onClick={handlePrint} className="btn-secondary flex items-center gap-2"><FiPrinter /> طباعة</button>
      </div>

      <div className="card" id="invoice-print">
        {/* Header */}
        <div className="text-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">نظام إدارة المخزون والمبيعات</h2>
          <p className="text-gray-500 text-sm mt-1">{invoice.branch?.name} - {invoice.branch?.address}</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><strong>رقم الفاتورة:</strong> {invoice.invoiceNumber}</p>
            <p><strong>النوع:</strong> {invoice.type === 'SALE' ? 'بيع' : 'إرجاع'}</p>
            <p><strong>طريقة الدفع:</strong> {paymentMap[invoice.paymentMethod]}</p>
          </div>
          <div className="text-left">
            <p><strong>التاريخ:</strong> {new Date(invoice.createdAt).toLocaleString('ar')}</p>
            <p><strong>الكاشير:</strong> {invoice.user?.name}</p>
            {invoice.customer && <p><strong>العميل:</strong> {invoice.customer.name}</p>}
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-2 text-right">#</th>
              <th className="py-2 text-right">المنتج</th>
              <th className="py-2 text-center">الكمية</th>
              <th className="py-2 text-center">السعر</th>
              <th className="py-2 text-center">الخصم</th>
              <th className="py-2 text-center">الضريبة</th>
              <th className="py-2 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{i + 1}</td>
                <td className="py-2">{item.product?.name}<br/><span className="text-xs text-gray-400">{item.product?.sku}</span></td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-center">{item.price?.toFixed(2)}</td>
                <td className="py-2 text-center">{item.discount?.toFixed(2)}</td>
                <td className="py-2 text-center">{item.tax?.toFixed(2)}</td>
                <td className="py-2 text-left font-medium">{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t-2 border-gray-300 pt-4 space-y-1 text-sm max-w-xs mr-auto">
          <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{invoice.subtotal?.toFixed(2)} ج.م</span></div>
          <div className="flex justify-between text-gray-500"><span>الضريبة:</span><span>{invoice.taxAmount?.toFixed(2)} ج.م</span></div>
          {invoice.discount > 0 && <div className="flex justify-between text-red-500"><span>الخصم:</span><span>-{invoice.discount?.toFixed(2)} ج.م</span></div>}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>الإجمالي:</span>
            <span>{invoice.total?.toFixed(2)} ج.م</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t text-xs text-gray-400">
          <p>تم التطوير بواسطة AmrAlaa</p>
        </div>
      </div>
    </div>
  );
}
