'use client';

import React, { useEffect, useState } from 'react';
import {
  QrCode,
  CreditCard,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Send,
  Sparkles,
} from 'lucide-react';
import { formatCurrencyPEN } from '../../lib/utils/format-currency';
import { generateWhatsAppOrderLink } from '../../lib/utils/whatsapp-link';

interface CartItem {
  productId: string;
  productName: string;
  sizeId: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);

  // Active Payment Tab: 'yape' | 'plin' | 'bcp' | 'bbva' | 'interbank'
  const [activePaymentTab, setActivePaymentTab] = useState<'yape' | 'plin' | 'bcp' | 'bbva' | 'interbank'>('yape');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [operationCode, setOperationCode] = useState('');
  const [voucherFile, setVoucherFile] = useState<File | null>(null);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{ orderNumber: string; waLink: string } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Load real active products from database to ensure valid product/size UUIDs
  useEffect(() => {
    async function loadRealCartItems() {
      try {
        setLoadingItems(true);
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const products = await res.json();
          if (products && products.length > 0) {
            const realItems: CartItem[] = products.slice(0, 2).map((p: any) => {
              const sizeObj = p.sizes?.[0];
              const sizeId = sizeObj?.sizeId || sizeObj?.size?.id || sizeObj?.id || '';
              return {
                productId: p.id,
                productName: p.name,
                sizeId: sizeId,
                sizeLabel: sizeObj?.label || 'L',
                quantity: 1,
                unitPrice: p.basePrice,
              };
            });
            setCartItems(realItems);
          }
        }
      } catch (e) {
        console.error('Error al cargar productos reales para checkout:', e);
      } finally {
        setLoadingItems(false);
      }
    }

    loadRealCartItems();
  }, [API_BASE]);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVoucherFile(e.target.files[0]);
    }
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Debes ingresar tu Nombre y Teléfono de contacto.');
      return;
    }
    if (!operationCode.trim()) {
      setErrorMessage('El Número de Operación del voucher es obligatorio.');
      return;
    }
    if (!voucherFile) {
      setErrorMessage('Debes adjuntar la foto o archivo del voucher de pago.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Create Order via POST /orders/checkout
      const resOrder = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          items: cartItems.map((i) => ({
            productId: i.productId,
            sizeId: i.sizeId,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = await resOrder.json();
      if (!resOrder.ok) {
        throw new Error(orderData.message || 'Error al crear la orden.');
      }

      const createdOrder = orderData.order;

      // Step 2: Upload Receipt via POST /payments/upload-receipt (TR-024, TR-025)
      const formData = new FormData();
      formData.append('file', voucherFile);
      formData.append('orderId', createdOrder.id);
      formData.append('operationCode', operationCode.trim());

      const resPayment = await fetch(`${API_BASE}/payments/upload-receipt`, {
        method: 'POST',
        body: formData,
      });

      const paymentData = await resPayment.json();

      // TR-025: Handle HTTP 409 Conflict for duplicate operation code or SHA-256 hash
      if (resPayment.status === 409) {
        throw new Error(paymentData.message || 'El comprobante o código de operación ya ha sido registrado previamente.');
      }

      if (!resPayment.ok) {
        throw new Error(paymentData.message || 'Error al validar el comprobante de pago.');
      }

      // Step 3: TR-023 Generate WhatsApp Direct Link
      const waLink = generateWhatsAppOrderLink({
        orderNumber: createdOrder.orderNumber,
        customerName: createdOrder.customerName,
        totalAmount: createdOrder.totalAmount,
        operationCode: operationCode.trim(),
        items: cartItems,
      });

      setSuccessOrder({
        orderNumber: createdOrder.orderNumber,
        waLink,
      });

      // Automatically open WhatsApp link
      window.open(waLink, '_blank');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado durante el checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>PAGO SEGURO • YAPE / PLIN / BANCOS • ATENCIÓN DIRECTA TALLER AMIAS</span>
      </div>

      {/* Header */}
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </div>
          <div className="text-xs uppercase font-semibold text-neutral-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Checkout Seguro (PEN S/)</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {/* Success Modal / Banner */}
        {successOrder ? (
          <div className="max-w-2xl mx-auto bg-emerald-50 border border-emerald-300 p-8 space-y-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest block">
                ¡PEDIDO REGISTRADO Y COMPROBANTE VALIDADO!
              </span>
              <h1 className="text-3xl font-extrabold uppercase text-neutral-900">
                Orden {successOrder.orderNumber}
              </h1>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Tu comprobante y código de operación fueron verificados con éxito. Haz clic abajo para confirmar tu pedido en WhatsApp.
              </p>
            </div>
            <a
              href={successOrder.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg transition"
            >
              <span>Abrir WhatsApp AMIAS</span>
              <Send className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Payment Methods & QR Section (TR-022) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400 block">
                  PASO 1 DE 2 — PAGO DIRECTO
                </span>
                <h1 className="text-2xl font-bold uppercase tracking-tight text-[#121212] mt-1">
                  Métodos de Pago Disponibles
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Transfiere o yapea el monto exacto y conserva tu número de operación y voucher.
                </p>
              </div>

              {/* Payment Tabs */}
              <div className="border border-[#e8e8e8] bg-white">
                <div className="flex border-b border-[#e8e8e8] bg-[#fafafa]">
                  {(['yape', 'plin', 'bcp', 'bbva', 'interbank'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setActivePaymentTab(method)}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                        activePaymentTab === method
                          ? 'border-[#121212] text-[#121212] bg-white'
                          : 'border-transparent text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Yape / Plin View */}
                  {(activePaymentTab === 'yape' || activePaymentTab === 'plin') && (
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      {/* QR Mockup */}
                      <div className="w-44 h-44 bg-neutral-900 text-white p-4 flex flex-col items-center justify-center border border-neutral-800 shadow-inner text-center relative group">
                        <QrCode className="w-24 h-24 text-amber-300" />
                        <span className="text-[10px] uppercase font-bold tracking-widest mt-2">
                          QR {activePaymentTab.toUpperCase()} AMIAS
                        </span>
                      </div>

                      <div className="space-y-4 text-xs font-sans flex-1">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">
                            Titular de la cuenta
                          </span>
                          <span className="text-sm font-bold text-[#121212]">AMIAS STUDIO S.A.C.</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">
                            Número Yape / Plin
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-base font-mono font-bold text-[#121212]">999 999 999</span>
                            <button
                              onClick={() => copyToClipboard('999999999', 'phone')}
                              className="px-2.5 py-1 text-[10px] uppercase font-bold border border-neutral-300 hover:border-neutral-900 flex items-center gap-1 transition"
                            >
                              {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'phone' ? 'Copiado' : 'Copiar'}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-neutral-500 bg-neutral-50 p-2.5 border border-neutral-200">
                          Al yapear o plinear, verifica que el nombre corresponda a **AMIAS STUDIO S.A.C.** y guarda tu captura.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bank Accounts View */}
                  {activePaymentTab === 'bcp' && (
                    <div className="space-y-4 text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-sm">Banco de Crédito del Perú (BCP)</span>
                      </div>

                      <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-3 font-mono">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Número de Cuenta Corriente:</span>
                            <span className="font-bold text-[#121212]">193-98765432-0-11</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard('193-98765432-0-11', 'bcp_cta')}
                            className="px-2.5 py-1 text-[10px] uppercase font-bold border border-neutral-300 bg-white hover:border-neutral-900"
                          >
                            {copiedField === 'bcp_cta' ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">CCI (Interbancario):</span>
                            <span className="font-bold text-[#121212]">00219300987654320111</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard('00219300987654320111', 'bcp_cci')}
                            className="px-2.5 py-1 text-[10px] uppercase font-bold border border-neutral-300 bg-white hover:border-neutral-900"
                          >
                            {copiedField === 'bcp_cci' ? 'Copiado' : 'Copiar CCI'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePaymentTab === 'bbva' && (
                    <div className="space-y-4 text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-800" />
                        <span className="font-bold text-sm">BBVA Perú</span>
                      </div>

                      <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-3 font-mono">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Número de Cuenta:</span>
                            <span className="font-bold text-[#121212]">0011-0123-0100098765</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard('0011-0123-0100098765', 'bbva_cta')}
                            className="px-2.5 py-1 text-[10px] uppercase font-bold border border-neutral-300 bg-white hover:border-neutral-900"
                          >
                            {copiedField === 'bbva_cta' ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePaymentTab === 'interbank' && (
                    <div className="space-y-4 text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-sm">Interbank</span>
                      </div>

                      <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-3 font-mono">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Número de Cuenta:</span>
                            <span className="font-bold text-[#121212]">200-3001234567</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard('200-3001234567', 'ibk_cta')}
                            className="px-2.5 py-1 text-[10px] uppercase font-bold border border-neutral-300 bg-white hover:border-neutral-900"
                          >
                            {copiedField === 'ibk_cta' ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmitCheckout} className="space-y-6 border border-[#e8e8e8] p-6 sm:p-8 bg-white">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400 block">
                    PASO 2 DE 2 — REGISTRO Y VOUCHER
                  </span>
                  <h2 className="text-xl font-bold uppercase text-[#121212] mt-0.5">
                    Datos del Cliente y Comprobante
                  </h2>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-neutral-700 block">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-neutral-700 block">
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 987654321"
                      className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-neutral-700 block">
                    Número de Operación del Voucher * (Yape / Plin / Banco)
                  </label>
                  <input
                    type="text"
                    required
                    value={operationCode}
                    onChange={(e) => setOperationCode(e.target.value)}
                    placeholder="Ej. 089764"
                    className="w-full px-3.5 py-3 border border-[#cccccc] text-xs font-mono focus:outline-none focus:border-[#121212]"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Se verificará la unicidad criptográfica de este código para prevenir duplicados.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-neutral-700 block">
                    Adjuntar Foto o PDF del Voucher *
                  </label>
                  <div className="border border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 p-4 text-center cursor-pointer">
                    <input
                      type="file"
                      id="voucher-file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="voucher-file" className="cursor-pointer block space-y-1">
                      <Upload className="w-5 h-5 mx-auto text-neutral-500" />
                      <span className="text-xs font-semibold text-[#121212] block">
                        {voucherFile ? `✓ ${voucherFile.name}` : 'Seleccionar comprobante (JPEG, PNG o PDF)'}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        Se calculará la firma criptográfica SHA-256 en memoria para validar la constancia.
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loadingItems || cartItems.length === 0}
                  className="w-full py-4 bg-[#121212] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Verificando y Generando Pedido...' : 'Confirmar Pedido y Enviar a WhatsApp'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-[#e8e8e8] p-6 sm:p-8 bg-[#fafafa] space-y-6 sticky top-28">
                <div className="border-b border-[#e8e8e8] pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-neutral-800" />
                    <h2 className="text-lg font-bold uppercase text-[#121212]">Resumen del Pedido</h2>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">PEN (S/)</span>
                </div>

                {loadingItems ? (
                  <div className="py-8 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Cargando prendas activas del catálogo...
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200 text-xs font-sans space-y-3 pt-1">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="pt-3 flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-[#121212]">{item.productName}</h4>
                          <span className="text-[11px] text-neutral-500 block">
                            Talla: <strong className="text-neutral-800">{item.sizeLabel}</strong> • Cantidad: {item.quantity}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#121212]">
                          {formatCurrencyPEN(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t-2 border-[#121212] pt-4 flex items-center justify-between text-sm">
                  <span className="font-extrabold uppercase text-[#121212]">Total A Pagar</span>
                  <span className="font-mono font-extrabold text-lg text-[#121212]">
                    {formatCurrencyPEN(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
