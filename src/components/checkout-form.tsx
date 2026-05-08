'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Headphones, Loader2, LockKeyhole, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { calculateCartTotals, type PendingOrder, PENDING_ORDER_KEY } from '@/lib/cart';
import { formatZar } from '@/lib/money';
import { trackEvent } from '@/lib/analytics';

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryNotes: string;
};

const emptyState: FormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
  deliveryNotes: '',
};

const provinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
];

const requiredFields: Array<keyof FormState> = ['name', 'email', 'phone', 'address', 'suburb', 'city', 'province', 'postalCode'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanPaymentError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('cart cannot be empty') || lower.includes('missing')) {
    return 'Missing cart: please return to your cart and confirm the items before paying.';
  }
  if (lower.includes('invalid cart') || lower.includes('invalid product')) {
    return 'Invalid product: one item in your cart is no longer available. Please remove it and try again.';
  }
  if (lower.includes('customer')) {
    return 'Some checkout details are missing or invalid. Please check your contact and delivery details.';
  }
  if (lower.includes('not configured')) {
    return 'Online payment is not configured yet. Please contact PawTrip SA support before placing this order.';
  }
  return 'Payment creation failed. Please try again, or contact PawTrip SA before paying.';
}

export function CheckoutForm() {
  const { items, products } = useCart();
  const totals = useMemo(() => calculateCartTotals(items, products), [items, products]);
  const invalidItems = useMemo(() => items.filter((item) => !products.some((product) => product.slug === item.productSlug)), [items, products]);
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const compareAtSubtotal = totals.items.reduce((sum, item) => sum + item.product.compareAtPrice * item.quantity, 0);
  const savings = Math.max(0, compareAtSubtotal - totals.subtotal);
  const cartIssue =
    itemCount === 0
      ? 'Missing cart: add products to your cart before starting checkout.'
      : invalidItems.length > 0
        ? 'Invalid product: one item in your cart is no longer available. Please remove it from the cart before paying.'
        : '';

  useEffect(() => {
    trackEvent('begin_checkout', {
      currency: 'ZAR',
      value: totals.total,
      item_count: itemCount,
    });
  }, [itemCount, totals.total]);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    for (const field of requiredFields) {
      if (!form[field].trim()) nextErrors[field] = 'This field is required.';
    }

    if (form.email.trim() && !emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    setErrors(nextErrors);
    setSubmitError('');

    if (cartIssue) {
      setSubmitError(cartIssue);
      return;
    }

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/payfast/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map((item) => ({ productSlug: item.productSlug, quantity: item.quantity })),
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        setSubmitError(cleanPaymentError(errorPayload?.error ?? 'Payment creation failed.'));
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as {
        payment: {
          url: string;
          fields: Record<string, string>;
        };
        order: PendingOrder;
      };

      window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(payload.order));
      trackEvent('payment_redirect_started', {
        currency: 'ZAR',
        value: payload.order.total,
        order_reference: payload.order.orderReference,
      });

      const formElement = document.createElement('form');
      formElement.method = 'POST';
      formElement.action = payload.payment.url;
      Object.entries(payload.payment.fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        formElement.appendChild(input);
      });
      document.body.appendChild(formElement);
      formElement.submit();
    } catch {
      setSubmitError('Network error: payment could not be prepared. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <form className="checkoutForm checkoutTrustForm" onSubmit={onSubmit} noValidate>
      <div className="secureCheckoutHeader">
        <div>
          <span className="eyebrow">
            <LockKeyhole size={14} /> Secure checkout
          </span>
          <h2>Secure checkout</h2>
          <p>Your payment is processed through PayFast. PawTrip SA does not store your card details.</p>
        </div>
        <div className="checkoutTrustBadges" aria-label="Checkout trust points">
          <span>
            <ShieldCheck size={15} /> Secure payment
          </span>
          <span>
            <Truck size={15} /> Clear delivery updates
          </span>
          <span>
            <Headphones size={15} /> Easy support
          </span>
          <span>
            <FileText size={15} /> Honest returns policy
          </span>
        </div>
      </div>

      <div className="checkoutGrid checkoutTrustGrid">
        <div className="card formCard checkoutDetailsCard">
          <h2>Delivery details</h2>
          <div className="deliveryExpectation checkoutNotice">
            <Truck size={18} />
            <p>Delivery estimates depend on product availability and your location. Orders are processed after payment confirmation.</p>
          </div>

          <AnimatePresence>
            {cartIssue ? (
              <motion.div className="checkoutAlert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                <PackageCheck size={18} />
                <p>{cartIssue}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="fieldGrid">
            {[
              ['name', 'Full name'],
              ['email', 'Email address'],
              ['phone', 'Phone number'],
              ['address', 'Street address'],
              ['suburb', 'Suburb'],
              ['city', 'City'],
              ['postalCode', 'Postal code'],
            ].map(([field, label]) => (
              <label key={field} className="field">
                <span>{label}</span>
                <input
                  className={errors[field as keyof FormState] ? 'input inputError' : 'input'}
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  value={form[field as keyof FormState]}
                  onChange={(event) => update(field as keyof FormState, event.target.value)}
                  aria-invalid={Boolean(errors[field as keyof FormState])}
                  aria-describedby={errors[field as keyof FormState] ? `${field}-error` : undefined}
                  autoComplete={
                    field === 'name'
                      ? 'name'
                      : field === 'email'
                        ? 'email'
                        : field === 'phone'
                          ? 'tel'
                          : field === 'address'
                            ? 'street-address'
                            : field === 'city'
                              ? 'address-level2'
                              : field === 'postalCode'
                                ? 'postal-code'
                                : undefined
                  }
                />
                <AnimatePresence>
                  {errors[field as keyof FormState] ? (
                    <motion.small
                      id={`${field}-error`}
                      className="errorText"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      {errors[field as keyof FormState]}
                    </motion.small>
                  ) : null}
                </AnimatePresence>
              </label>
            ))}

            <label className="field">
              <span>Province</span>
              <select
                className={errors.province ? 'input inputError' : 'input'}
                value={form.province}
                onChange={(event) => update('province', event.target.value)}
                aria-invalid={Boolean(errors.province)}
                aria-describedby={errors.province ? 'province-error' : undefined}
                autoComplete="address-level1"
              >
                <option value="">Select province</option>
                {provinces.map((province) => (
                  <option value={province} key={province}>
                    {province}
                  </option>
                ))}
              </select>
              <AnimatePresence>
                {errors.province ? (
                  <motion.small id="province-error" className="errorText" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                    {errors.province}
                  </motion.small>
                ) : null}
              </AnimatePresence>
            </label>

            <label className="field fieldFull">
              <span>Delivery notes</span>
              <textarea className="textarea" value={form.deliveryNotes} onChange={(event) => update('deliveryNotes', event.target.value)} />
            </label>
          </div>

          <div className="checkoutPolicyLinks">
            <Link href="/shipping-returns">Shipping & Returns</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>

          <div className="checkoutSupportBlock">
            <Headphones size={18} />
            <div>
              <strong>Need help before paying? Contact PawTrip SA.</strong>
              <p>
                Use the <Link href="/contact">contact form</Link> or email <a href="mailto:support@pawtripsa.co.za">support@pawtripsa.co.za</a>.
              </p>
            </div>
          </div>
        </div>

        <aside className="card stickySummary checkoutSummaryCard">
          <h2>Order summary</h2>
          <div className="summaryList checkoutSummaryItems">
            {totals.items.map((item) => (
              <div key={item.productSlug} className="summaryItem checkoutSummaryItem">
                <div>
                  <span>{item.product.name}</span>
                  <small>Quantity: {item.quantity}</small>
                </div>
                <strong>{formatZar(item.lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div className="summaryRow">
            <span>Items</span>
            <strong>{totals.items.length}</strong>
          </div>
          <div className="summaryRow">
            <span>Quantity</span>
            <strong>{itemCount}</strong>
          </div>
          <div className="summaryRow">
            <span>Subtotal</span>
            <strong>{formatZar(totals.subtotal)}</strong>
          </div>
          <div className="summaryRow">
            <span>Delivery fee</span>
            <strong>{formatZar(totals.deliveryFee)}</strong>
          </div>
          {savings > 0 ? (
            <div className="summaryRow savingsRow">
              <span>Savings from compare-at prices</span>
              <strong>{formatZar(savings)}</strong>
            </div>
          ) : null}
          <div className="summaryRow totalRow">
            <span>Total</span>
            <strong>{formatZar(totals.total)}</strong>
          </div>

          <div className="trustBlock">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure online payment</strong>
              <p>You will be redirected to PayFast. PawTrip SA does not store your card details.</p>
            </div>
          </div>
          <div className="trustBlock">
            <MapPin size={18} />
            <div>
              <strong>Delivery expectation</strong>
              <p>Delivery estimates depend on product availability and your location. Orders are processed after payment confirmation.</p>
            </div>
          </div>

          <button type="submit" className="button buttonPrimary checkoutButton buttonSheen" disabled={loading || Boolean(cartIssue)}>
            {loading ? <Loader2 className="spin" size={16} /> : null}
            Pay securely with PayFast
          </button>
          <AnimatePresence>
            {submitError ? (
              <motion.p className="checkoutSubmitError" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                {submitError}
              </motion.p>
            ) : null}
          </AnimatePresence>
          <p className="checkoutSmallPrint">Orders are processed after payment confirmation. You can review policies or contact us before paying.</p>
        </aside>
      </div>
    </form>
  );
}
