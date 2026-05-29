'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { TouchEvent } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, CreditCard, Info, Minus, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatZar } from '@/lib/money';
import type { Product } from '@/data/products';
import { FaqAccordion } from '@/components/faq-accordion';
import { getProductImageAlt, ProductImage } from '@/components/product-image';
import { RecentlyViewedProducts, rememberRecentlyViewed } from '@/components/recently-viewed-products';
import { gaItem, trackEvent } from '@/lib/analytics';

type ProductDetailInternalLink = {
  title: string;
  href: string;
  description?: string;
  label?: string;
};

export function ProductDetailClient({
  product,
  related,
  relatedProblems = [],
  relatedGuides = [],
}: {
  product: Product;
  related: Product[];
  relatedProblems?: ProductDetailInternalLink[];
  relatedGuides?: ProductDetailInternalLink[];
}) {
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showMobileBuyBar, setShowMobileBuyBar] = useState(false);
  const activeVariants = useMemo(
    () => (product.variants ?? []).filter((variant) => variant.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [product.variants],
  );
  const preferredVariantId = activeVariants.find((variant) => variant.stockQuantity > 0)?.id ?? activeVariants[0]?.id ?? '';
  const [selectedVariantId, setSelectedVariantId] = useState(preferredVariantId);
  const activeCustomOptions = useMemo(
    () => (product.customOptions ?? []).filter((option) => option.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [product.customOptions],
  );
  const [customOptionValues, setCustomOptionValues] = useState<Record<string, string>>({});
  const [customOptionErrors, setCustomOptionErrors] = useState<Record<string, string>>({});
  const { addItem, products } = useCart();
  const productRecord = product as Partial<Product>;
  const asList = (value: unknown) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  const asFaqList = (value: unknown) =>
    Array.isArray(value)
      ? value.filter(
          (item): item is { question: string; answer: string } =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as { question?: string }).question === 'string' &&
            typeof (item as { answer?: string }).answer === 'string' &&
            (item as { question: string }).question.trim().length > 0 &&
            (item as { answer: string }).answer.trim().length > 0,
        )
      : [];
  const fallbackImage = typeof productRecord.image === 'string' && productRecord.image.trim().length > 0 ? productRecord.image : '';
  const galleryImages = asList(productRecord.galleryImages).length
    ? asList(productRecord.galleryImages)
    : asList(productRecord.gallery).length
      ? asList(productRecord.gallery)
      : fallbackImage
        ? [fallbackImage]
        : [];
  const safeBestFor = asList(productRecord.bestFor);
  const safeBenefits = asList(productRecord.benefits);
  const safeFeatures = asList(productRecord.features);
  const safeProblemsSolved = asList(productRecord.problemsSolved);
  const safeQualityNotes = asList(productRecord.qualityNotes);
  const safeDimensions = asList(productRecord.dimensions);
  const safeCompatibility = asList(productRecord.compatibility);
  const safeNotIdealFor = asList(productRecord.notIdealFor);
  const safeHowToUse = asList(productRecord.howToUse);
  const safeMeasurements = asList(productRecord.measurements);
  const safeIncluded = asList(productRecord.whatsIncluded);
  const safeCareInstructions = asList(productRecord.careInstructions);
  const safeFaqs = asFaqList(productRecord.faqs);
  const productName = typeof productRecord.name === 'string' && productRecord.name.trim().length > 0 ? productRecord.name : 'PawTrip SA product';
  const categoryLabel =
    typeof productRecord.categoryName === 'string' && productRecord.categoryName.trim().length > 0
      ? productRecord.categoryName
      : typeof productRecord.category === 'string' && productRecord.category.trim().length > 0
        ? productRecord.category
        : 'Dog essentials';
  const categoryValue =
    typeof productRecord.category === 'string' && productRecord.category.trim().length > 0 ? productRecord.category : categoryLabel;
  const categorySlug =
    typeof productRecord.categorySlug === 'string' && productRecord.categorySlug.trim().length > 0 ? productRecord.categorySlug : null;
  const shortDescription =
    typeof productRecord.shortDescription === 'string' && productRecord.shortDescription.trim().length > 0
      ? productRecord.shortDescription
      : 'Practical dog travel and everyday pet gear for South African pet owners.';
  const fullDescription =
    typeof productRecord.longDescription === 'string' && productRecord.longDescription.trim().length > 0
      ? productRecord.longDescription
      : typeof productRecord.fullDescription === 'string' && productRecord.fullDescription.trim().length > 0
        ? productRecord.fullDescription
        : shortDescription;
  const material =
    typeof productRecord.material === 'string' && productRecord.material.trim().length > 0
      ? productRecord.material
      : 'Material details are being confirmed with the supplier.';
  const deliveryNote =
    typeof productRecord.deliveryNote === 'string' && productRecord.deliveryNote.trim().length > 0
      ? productRecord.deliveryNote
      : 'Delivery estimates depend on product availability and customer location.';
  const returnNote =
    typeof productRecord.returnNote === 'string' && productRecord.returnNote.trim().length > 0
      ? productRecord.returnNote
      : 'Unused items can be returned in line with our returns policy.';
  const availability =
    typeof productRecord.availability === 'string' && productRecord.availability.trim().length > 0
      ? productRecord.availability
      : 'checking_availability';
  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId) ?? activeVariants[0] ?? null;
  const stockQuantity =
    selectedVariant
      ? selectedVariant.stockQuantity
      : typeof productRecord.stockQuantity === 'number' && Number.isFinite(productRecord.stockQuantity)
        ? productRecord.stockQuantity
        : null;
  const shippingClass =
    typeof productRecord.shippingClass === 'string' && productRecord.shippingClass.trim().length > 0
      ? productRecord.shippingClass
      : 'standard';
  const price = selectedVariant?.price ?? (typeof productRecord.price === 'number' && Number.isFinite(productRecord.price) ? productRecord.price : 0);
  const compareAtPrice =
    selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > 0
      ? selectedVariant.compareAtPrice
      : typeof productRecord.compareAtPrice === 'number' && Number.isFinite(productRecord.compareAtPrice) && productRecord.compareAtPrice > 0
      ? productRecord.compareAtPrice
      : price;
  const image = galleryImages[selected] ?? fallbackImage;
  const savings = Math.max(0, compareAtPrice - price);
  const isOutOfStock = stockQuantity === 0;
  const stockMessage = stockQuantity === null ? availability.replaceAll('_', ' ') : stockQuantity > 10 ? 'In stock' : stockQuantity > 0 ? 'Low stock' : 'Out of stock';
  const stockClass = stockQuantity === 0 ? 'stockOut' : stockQuantity !== null && stockQuantity <= 10 ? 'stockLow' : 'stockIn';
  const isDogToy = categorySlug === 'dog-toys' || categorySlug === 'toys' || categoryValue.toLowerCase().includes('toy');
  const needsSupplierImages = process.env.NODE_ENV === 'development' && product.sourcePermissionStatus !== 'supplier_permission_confirmed';
  const faqItems =
    safeFaqs.length > 0
      ? safeFaqs
      : [
          {
            question: `What should I check before ordering ${productName.toLowerCase()}?`,
            answer: 'Review the product description, measurements and delivery note to make sure the setup matches your dog and vehicle or home routine.',
          },
          {
            question: 'How are delivery timelines handled?',
            answer: 'Delivery estimates depend on product availability and customer location.',
          },
        ];

  useEffect(() => {
    rememberRecentlyViewed(product.slug);
    trackEvent('view_item', {
      currency: 'ZAR',
      value: price,
      items: [gaItem(product)],
    });
  }, [price, product]);

  useEffect(() => {
    setSelected(0);
    setQuantity(1);
    setSelectedVariantId(preferredVariantId);
    setCustomOptionValues({});
    setCustomOptionErrors({});
  }, [preferredVariantId, product.slug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setShowMobileBuyBar(window.scrollY > 520);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function showPreviousImage() {
    setSelected((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  }

  function showNextImage() {
    setSelected((current) => (current + 1) % galleryImages.length);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null || galleryImages.length < 2) return;
    const delta = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 42) {
      if (delta > 0) showNextImage();
      else showPreviousImage();
    }
    setTouchStart(null);
  }

  function updateCustomOption(optionId: string, value: string) {
    setCustomOptionValues((current) => ({ ...current, [optionId]: value }));
    setCustomOptionErrors((current) => ({ ...current, [optionId]: '' }));
  }

  function buildCustomOptionsForCart() {
    const nextErrors: Record<string, string> = {};
    const cleaned: Record<string, string> = {};

    for (const option of activeCustomOptions) {
      const value = (customOptionValues[option.id] ?? '').trim();
      if (option.required && !value) {
        nextErrors[option.id] = `${option.label} is required.`;
        continue;
      }
      if (option.maxLength && value.length > option.maxLength) {
        nextErrors[option.id] = `${option.label} must be ${option.maxLength} characters or fewer.`;
        continue;
      }
      if (option.inputType === 'select' && value && option.choices?.length && !option.choices.includes(value)) {
        nextErrors[option.id] = `Choose a valid ${option.label.toLowerCase()}.`;
        continue;
      }
      if (value) cleaned[option.label] = value;
    }

    setCustomOptionErrors(nextErrors);
    return Object.keys(nextErrors).length ? null : cleaned;
  }

  function handleAddToCart() {
    const customOptions = buildCustomOptionsForCart();
    if (!customOptions) return;
    addItem(product.slug, quantity, selectedVariant?.id ?? null, customOptions);
  }

  const badges = useMemo(
    () => [
      'Secure online checkout',
      'Practical travel kits',
      'Clear delivery estimates',
      'Built for dog owners',
    ],
    [],
  );
  const includedProductLinks = useMemo(
    () =>
      safeIncluded
        .map((included) => products.find((entry) => entry.name.toLowerCase() === included.toLowerCase()))
        .filter(Boolean) as Product[],
    [products, safeIncluded],
  );

  return (
    <div className="productLayout">
      <div className="productGallery">
        <motion.div
          className="productStage"
          key={image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <ProductImage
            src={image}
            alt={getProductImageAlt(productName, categoryValue, `gallery image ${selected + 1}`)}
            productName={productName}
            category={categoryValue}
            priority
          />
        </motion.div>
        {galleryImages.length > 1 ? (
          <div className="thumbRow">
            {galleryImages.map((thumb, index) => (
              <button
                type="button"
                key={thumb}
                className={selected === index ? 'thumbButton thumbButtonActive' : 'thumbButton'}
                onClick={() => setSelected(index)}
                aria-label={`Show ${productName} image ${index + 1}`}
              >
                <ProductImage
                  src={thumb}
                  alt={getProductImageAlt(productName, categoryValue, `thumbnail ${index + 1}`)}
                  productName={productName}
                  category={categoryValue}
                />
              </button>
            ))}
          </div>
        ) : null}
        {needsSupplierImages ? (
          <div className="imagePermissionNote">
            Internal note: supplier-approved or original product photos are still needed before final public launch.
          </div>
        ) : null}
        <div className="contentCard detailBlock">
          <h2>Product overview</h2>
          <p>{fullDescription}</p>
        </div>
        <div className="contentCard detailBlock">
          <div className="fitmentHelpBox">
            <strong>Fitment and choosing help</strong>
            <p>
              Check the measurements below against your car or home setup before ordering. Not sure what to choose?{' '}
              <Link href="/find-my-kit">Use the kit finder</Link> or <Link href="/contact">contact support</Link>.
            </p>
          </div>
          <h2>What problem it solves</h2>
          {safeProblemsSolved.length ? (
            <ul className="bulletList">
              {safeProblemsSolved.map((item) => (
                <li key={item}>
                  <Info size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{shortDescription}</p>
          )}
        </div>
        {relatedProblems.length || relatedGuides.length ? (
          <div className="contentCard detailBlock">
            <span className="eyebrow">Helpful next steps</span>
            <h2>More ways to choose confidently.</h2>
            <div className="internalLinkGrid">
              {relatedProblems.length ? (
                <div>
                  <h3>Related problems</h3>
                  <div className="internalLinkList">
                    {relatedProblems.slice(0, 4).map((link) => (
                      <Link href={link.href} key={link.href}>
                        <span>
                          {link.label ? (
                            <>
                              <small>{link.label}</small>
                              <br />
                            </>
                          ) : null}
                          {link.title}
                        </span>
                        <strong>View</strong>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
              {relatedGuides.length ? (
                <div>
                  <h3>Related guides</h3>
                  <div className="internalLinkList">
                    {relatedGuides.slice(0, 4).map((link) => (
                      <Link href={link.href} key={link.href}>
                        <span>
                          {link.label ? (
                            <>
                              <small>{link.label}</small>
                              <br />
                            </>
                          ) : null}
                          {link.title}
                        </span>
                        <strong>Read</strong>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="contentCard detailBlock">
          <h2>Quality and material notes</h2>
          <p>
            <strong>Material:</strong> {material}
          </p>
          {safeQualityNotes.length ? (
            <ul className="bulletList">
              {safeQualityNotes.map((item) => (
                <li key={item}>
                  <BadgeCheck size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Supplier-approved material and finish notes are still being finalised for this listing.</p>
          )}
        </div>
        <div className="contentCard detailBlock">
          <h2>Size, fit and compatibility</h2>
          {safeDimensions.length || safeCompatibility.length ? (
            <ul className="bulletList">
              {[...safeDimensions, ...safeCompatibility].map((item) => (
                <li key={item}>
                  <Truck size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Check the measurements section below and compare them to your car or setup before ordering.</p>
          )}
        </div>
        <div className="contentCard detailBlock">
          <h2>Best for</h2>
          {safeBestFor.length ? (
            <ul className="bulletList">
              {safeBestFor.map((item) => (
                <li key={item}>
                  <ShieldCheck size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Best suited to dog owners who want a practical, easy-to-understand setup.</p>
          )}
        </div>
        {safeNotIdealFor.length ? (
          <div className="contentCard detailBlock">
            <h2>Not ideal for</h2>
            <ul className="bulletList">
              {safeNotIdealFor.map((item) => (
                <li key={item}>
                  <Info size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="contentCard detailBlock">
          <h2>How to use it</h2>
          {safeHowToUse.length ? (
            <ul className="bulletList">
              {safeHowToUse.map((item) => (
                <li key={item}>
                  <BadgeCheck size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Set it up calmly, check the fit, and clean or dry the product between uses where needed.</p>
          )}
        </div>
        <div className="contentCard detailBlock">
          <h2>Features</h2>
          {safeFeatures.length ? (
            <ul className="bulletList">
              {safeFeatures.map((item, index) => (
                <motion.li key={item} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.22, delay: index * 0.04 }}>
                  <BadgeCheck size={16} /> <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p>{shortDescription}</p>
          )}
        </div>
        <div className="contentCard detailBlock">
          <h2>Measurements</h2>
          {safeMeasurements.length ? (
            <ul className="bulletList">
              {safeMeasurements.map((item) => (
                <li key={item}>
                  <Truck size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Detailed measurements are still being confirmed for this listing.</p>
          )}
        </div>
        <div className="contentCard detailBlock">
          <h2>What's included</h2>
          {safeIncluded.length ? (
            <ul className="bulletList">
              {safeIncluded.map((item) => (
                <li key={item}>
                  <ShieldCheck size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>This listing covers the main product shown in the gallery and description above.</p>
          )}
          {product.isBundle && includedProductLinks.length ? (
            <div className="internalLinkList">
              {includedProductLinks.map((item) => (
                <Link href={`/shop/product/${item.slug}`} key={item.slug}>
                  <span>View {item.name}</span>
                  <strong>Details</strong>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div className="contentCard detailBlock">
          <h2>Cleaning and care</h2>
          {safeCareInstructions.length ? (
            <ul className="bulletList">
              {safeCareInstructions.map((item) => (
                <li key={item}>
                  <BadgeCheck size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Wipe clean where needed and allow the product to dry fully before storing.</p>
          )}
        </div>
        {isDogToy ? (
          <div className="contentCard detailBlock">
            <h2>Safety note</h2>
            <p>Always supervise your dog during play. Remove the toy if damaged or if small parts become loose.</p>
          </div>
        ) : null}
        <div className="contentCard detailBlock">
          <h2>Delivery info</h2>
          <p>{deliveryNote}</p>
          <p>{returnNote}</p>
          <p>
            Shipping class: {shippingClass}. Availability: {availability.replaceAll('_', ' ')}.
          </p>
        </div>
        <div className="contentCard detailBlock">
          <h2>FAQ</h2>
          <FaqAccordion items={faqItems} />
        </div>
        <div className="contentCard detailBlock">
          <h2>Complete the setup</h2>
          {related.length ? (
            <div className="relatedCarousel">
              {related.map((item) => (
                <a key={item.slug} className="productCard" href={`/shop/product/${item.slug}`}>
                  <div className="productCardMedia">
                    <ProductImage
                      src={item.image}
                      alt={getProductImageAlt(item.name, item.category)}
                      productName={item.name}
                      category={item.category}
                      className="productImage"
                    />
                  </div>
                  <div className="productCardBody">
                    <strong>{item.name}</strong>
                    <p>{item.shortDescription || 'Useful add-on for the same routine.'}</p>
                    <div className="priceRow">
                      <strong>{formatZar(item.price)}</strong>
                      <span>{formatZar(item.compareAtPrice)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p>More related products will appear here as the range grows. For now, browse this product&apos;s category for the closest matches.</p>
          )}
        </div>
      </div>

      <aside className="stickyAddToCart">
        <div className="contentCard detailBlock">
          <div className="cardMeta">
            <span className="chip">{categoryLabel}</span>
            {categorySlug ? (
              <Link className="chip" href={`/shop/category/${categorySlug}`}>
                View category
              </Link>
            ) : null}
            <span className="chip chipAccent">Best for</span>
          </div>
          <div className="stickyTitleBlock">
            <h1>{productName}</h1>
            <p className="stickyShortDesc">{shortDescription}</p>
          </div>
          <div className="priceBlock">
            <strong>{formatZar(price)}</strong>
            <span>{compareAtPrice > price ? formatZar(compareAtPrice) : ''}</span>
          </div>
          {product.isBundle && savings > 0 ? (
            <div className="bundleSavingsCallout">Save {formatZar(savings)} with this bundle compared with the listed compare-at price.</div>
          ) : null}
          {activeVariants.length ? (
            <div className="variantSelector" aria-label={`${activeVariants[0]?.optionName || 'Option'} selector`}>
              <span>{activeVariants[0]?.optionName || 'Option'}</span>
              <div className="variantOptionGrid">
                {activeVariants.map((variant) => {
                  const disabled = variant.stockQuantity <= 0;
                  return (
                    <button
                      type="button"
                      key={variant.id}
                      className={selectedVariant?.id === variant.id ? 'variantOption variantOptionActive' : 'variantOption'}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      disabled={disabled}
                    >
                      <strong>{variant.optionValue}</strong>
                      <small>
                        {formatZar(variant.price)} · {disabled ? 'Out of stock' : `${variant.stockQuantity} available`}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {activeCustomOptions.length ? (
            <div className="customOptionPanel">
              <span>Personalisation details</span>
              <p>Enter engraving or custom details exactly as they should appear. Please double-check spelling before adding to cart.</p>
              <div className="customOptionGrid">
                {activeCustomOptions.map((option) => (
                  <label className="field" key={option.id}>
                    <span>
                      {option.label}
                      {option.required ? ' *' : ''}
                    </span>
                    {option.inputType === 'textarea' ? (
                      <textarea
                        className="textarea"
                        value={customOptionValues[option.id] ?? ''}
                        onChange={(event) => updateCustomOption(option.id, event.target.value)}
                        placeholder={option.placeholder ?? ''}
                        maxLength={option.maxLength ?? undefined}
                        rows={3}
                      />
                    ) : option.inputType === 'select' ? (
                      <select className="input" value={customOptionValues[option.id] ?? ''} onChange={(event) => updateCustomOption(option.id, event.target.value)}>
                        <option value="">Choose an option</option>
                        {(option.choices ?? []).map((choice) => (
                          <option value={choice} key={choice}>
                            {choice}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="input"
                        value={customOptionValues[option.id] ?? ''}
                        onChange={(event) => updateCustomOption(option.id, event.target.value)}
                        placeholder={option.placeholder ?? ''}
                        maxLength={option.maxLength ?? undefined}
                      />
                    )}
                    {option.helpText ? <small>{option.helpText}</small> : null}
                    {option.maxLength ? <small>{(customOptionValues[option.id] ?? '').length}/{option.maxLength} characters</small> : null}
                    {customOptionErrors[option.id] ? <small className="fieldError">{customOptionErrors[option.id]}</small> : null}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <div className={`availabilityNote ${stockClass}`}>
            {stockMessage}
            {stockQuantity !== null && stockQuantity > 0 && stockQuantity <= 10 ? `: ${stockQuantity} left` : null}
          </div>
          <div className="quantityRow">
            <button type="button" className="quantityButton" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
              <Minus size={16} />
            </button>
            <strong>{quantity}</strong>
            <button
              type="button"
              className="quantityButton"
              onClick={() => setQuantity((value) => (stockQuantity && stockQuantity > 0 ? Math.min(stockQuantity, value + 1) : value + 1))}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <button type="button" className="button buttonPrimary" onClick={handleAddToCart} disabled={isOutOfStock}>
            {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
          <div className="purchaseTrustRow">
            <span><CreditCard size={13} /> Secure PayFast checkout</span>
            <span><Truck size={13} /> Delivery calculated before payment</span>
            <span><ShieldCheck size={13} /> Support before paying</span>
            <span><RotateCcw size={13} /> Easy returns</span>
          </div>
          <div className="whyProductBox">
            <strong>Why this product?</strong>
            <ul>
              {(safeBenefits.length ? safeBenefits : [shortDescription]).slice(0, 3).map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
          <div className="trustBlock">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure checkout</strong>
              <p>PayFast handles the payment redirect. Orders are processed after payment confirmation.</p>
            </div>
          </div>
          <div className="buyTrustGrid">
            <span>
              <CreditCard size={15} /> PayFast-ready
            </span>
            <span>
              <Truck size={15} /> Clear delivery estimates
            </span>
            <span>
              <RotateCcw size={15} /> Returns policy applies
            </span>
          </div>
          <ul className="benefitList">
            {(safeBestFor.length ? safeBestFor : badges.slice(0, 3)).map((item, index) => (
              <motion.li key={item} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }}>
                <BadgeCheck size={16} /> <span>{item}</span>
              </motion.li>
            ))}
          </ul>
          <div className="productHelpLinks">
            <Link href="/shipping-returns">Shipping & returns</Link>
            <Link href="/contact">Ask before you buy</Link>
          </div>
        </div>

        <div className="contentCard detailBlock">
          <h2>Best for</h2>
          <ul className="bulletList">
            {[...(safeBestFor.length ? safeBestFor.slice(0, 3) : []), ...badges.slice(0, 2)].map((item) => (
              <li key={item}>
                <ShieldCheck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>{deliveryNote}</p>
          <p>{returnNote}</p>
          <p>Delivery estimate depends on product availability and your location.</p>
        </div>
      </aside>

      <div className={showMobileBuyBar ? 'mobileStickyCart mobileStickyCartVisible' : 'mobileStickyCart'}>
        <div>
          <strong>{formatZar(price)}</strong>
          <span>{stockMessage}</span>
        </div>
        <div className="mobileStickyQty" aria-label="Quantity">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
            <Minus size={14} />
          </button>
          <strong>{quantity}</strong>
          <button type="button" onClick={() => setQuantity((value) => (stockQuantity && stockQuantity > 0 ? Math.min(stockQuantity, value + 1) : value + 1))} aria-label="Increase quantity">
            <Plus size={14} />
          </button>
        </div>
        <button type="button" className="button buttonPrimary buttonSheen" onClick={handleAddToCart} disabled={isOutOfStock}>
          {isOutOfStock ? 'Out' : 'Add'}
        </button>
      </div>

      <div className="productWideBlock">
        {related.length ? (
          <section className="recentlyViewedBlock">
            <div className="sectionHeader">
              <span className="eyebrow">Complete the setup</span>
              <h2>Useful products to pair with this.</h2>
            </div>
            <div className="relatedCarousel">
              {related.map((item) => (
                <a key={item.slug} className="productCard" href={`/shop/product/${item.slug}`}>
                  <div className="productCardMedia">
                    <ProductImage
                      src={item.image}
                      alt={getProductImageAlt(item.name, item.category, 'complete the setup')}
                      productName={item.name}
                      category={item.category}
                      className="productImage"
                    />
                  </div>
                <div className="productCardBody">
                  <div className="cardMeta">
                    <span className="chip">Best for: {item.bestFor?.[0] ?? item.categoryName}</span>
                  </div>
                  <strong>{item.name}</strong>
                  <p>{item.shortDescription || 'Useful companion product for the same setup.'}</p>
                  <div className="priceRow">
                    <strong>{formatZar(item.price)}</strong>
                    <span>{formatZar(item.compareAtPrice)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}
        <RecentlyViewedProducts products={products} currentSlug={product.slug} />
      </div>
    </div>
  );
}
