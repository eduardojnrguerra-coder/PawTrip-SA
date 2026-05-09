'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, Car, CheckCircle2, Dog, Gauge, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCart } from '@/components/cart-provider';
import { getProductImageAlt, ProductImage } from '@/components/product-image';
import { blogPosts } from '@/data/blog';
import type { Product } from '@/data/products';
import { trackEvent } from '@/lib/analytics';
import { formatZar } from '@/lib/money';

type AnswerKey = 'pet' | 'carType' | 'dogSize' | 'problem' | 'buyerType';

type Question = {
  field: AnswerKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  options: string[];
};

type Recommendation = {
  primary: string;
  addOns: [string, string];
  guide: string;
  why: string;
};

const questions: Question[] = [
  {
    field: 'pet',
    eyebrow: 'Shopping for',
    title: 'What pet are you shopping for?',
    subtitle: 'PawTrip SA is dog-first for now, with cat products marked for later expansion.',
    icon: <Dog size={19} />,
    options: ['Dog', 'Puppy', 'Cat later'],
  },
  {
    field: 'carType',
    eyebrow: 'Vehicle setup',
    title: 'What car do you drive?',
    subtitle: 'This helps us choose between back-seat protection, boot protection or a non-car setup.',
    icon: <Car size={19} />,
    options: ['Hatchback', 'Sedan', 'SUV', 'Bakkie', 'Not car related'],
  },
  {
    field: 'dogSize',
    eyebrow: 'Fit and comfort',
    title: 'What size is your dog?',
    subtitle: 'Size affects access, comfort, toy choice and whether a bundle should stay light or go complete.',
    icon: <Gauge size={19} />,
    options: ['Small', 'Medium', 'Large', 'Giant', 'Puppy'],
  },
  {
    field: 'problem',
    eyebrow: 'Main problem',
    title: 'What problem are you solving?',
    subtitle: 'Pick the problem that would make the biggest difference this week.',
    icon: <ShieldCheck size={19} />,
    options: [
      'Dog hair in the car',
      'Mud, sand and mess',
      'Scratched seats',
      'Boredom and chewing',
      'Fast eating',
      'Senior dog access',
      'Puppy training',
      'Grooming/shedding',
    ],
  },
  {
    field: 'buyerType',
    eyebrow: 'Buying style',
    title: 'What kind of buyer are you?',
    subtitle: 'We will keep the recommendation practical and avoid pushing extras you do not need.',
    icon: <ShoppingBag size={19} />,
    options: ['I want the cheapest useful setup', 'I want the best value bundle', 'I want the most complete setup'],
  },
];

const cardVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.985 },
};

function bySlug(products: Product[], slug: string) {
  const fallback = products[0];
  const match = products.find((product) => product.slug === slug);
  if (!match && !fallback) {
    throw new Error('Product catalogue is empty.');
  }
  return match ?? fallback;
}

function buyerCopy(buyerType?: string) {
  if (buyerType === 'I want the cheapest useful setup') {
    return 'You chose a lean setup, so the add-ons stay focused on the most useful next steps.';
  }
  if (buyerType === 'I want the most complete setup') {
    return 'You asked for a complete setup, so the recommendation leans toward a fuller routine instead of a single product.';
  }
  return 'You chose best value, so the result balances a strong main kit with two sensible add-ons.';
}

function recommendationSlugs(answers: Partial<Record<AnswerKey, string>>): Recommendation {
  const carType = answers.carType;
  const problem = answers.problem;
  const buyer = buyerCopy(answers.buyerType);
  const puppy = answers.pet === 'Puppy' || answers.dogSize === 'Puppy' || problem === 'Puppy training';
  const carMess = problem === 'Dog hair in the car' || problem === 'Scratched seats';
  const largerVehicle = carType === 'SUV' || carType === 'Bakkie';
  const smallerVehicle = carType === 'Hatchback' || carType === 'Sedan';

  if (problem === 'Senior dog access') {
    return {
      primary: 'senior-dog-travel-kit',
      addOns: ['soft-crate-mat', 'pet-boot-barrier'],
      guide: 'dog-road-trip-checklist-south-africa',
      why: `Senior access needs a calmer loading plan, not just another accessory. This kit prioritises easier car entry, travel comfort and less strain on the owner. ${buyer}`,
    };
  }

  if (problem === 'Mud, sand and mess') {
    return {
      primary: 'beach-dog-kit',
      addOns: ['paw-cleaner-cup', 'dog-drying-towel'],
      guide: 'best-dog-travel-accessories-beach-trips',
      why: `Wet paws, sand and beach-day mess spread quickly through a car. This kit focuses on back-seat protection, wipe-down comfort and cleanup before the mess follows you inside. ${buyer}`,
    };
  }

  if (problem === 'Boredom and chewing') {
    return {
      primary: 'boredom-buster-toy-kit',
      addOns: ['puzzle-feeder-toy', 'durable-chew-bone-toy'],
      guide: 'best-toys-bored-dogs-destroy-everything',
      why: `Boredom usually needs different outlets: chewing, licking, sniffing and problem solving. This result gives your dog more than one way to stay busy. ${buyer}`,
    };
  }

  if (problem === 'Fast eating') {
    return {
      primary: 'slow-feeder-bowl',
      addOns: ['lick-mat', 'training-treats'],
      guide: 'best-slow-feeder-bowls-dogs-south-africa',
      why: `Fast eating is a feeding routine problem, so the best setup is a slow feeder plus enrichment and reward basics. It is useful without pretending to be a medical fix. ${buyer}`,
    };
  }

  if (puppy) {
    return {
      primary: 'puppy-starter-kit',
      addOns: ['training-treat-pouch', 'poop-bag-holder-and-refill'],
      guide: 'puppy-starter-kit-checklist-south-africa',
      why: `Puppies need useful basics more than a crowded basket: chewing outlets, training rewards, feeding control and simple walking support. ${buyer}`,
    };
  }

  if (problem === 'Grooming/shedding') {
    return {
      primary: 'grooming-starter-kit',
      addOns: ['paw-cleaner-cup', 'pet-hair-removal-brush'],
      guide: 'best-grooming-tools-dogs-that-shed',
      why: `Shedding is easier to manage when grooming and cleanup work together. This setup covers coat maintenance, drying and the car or couch hair that follows. ${buyer}`,
    };
  }

  if (carMess && largerVehicle) {
    return {
      primary: 'suv-protection-kit',
      addOns: ['pet-boot-barrier', 'foldable-dog-ramp-for-cars-and-suvs'],
      guide: 'dog-hammock-vs-dog-seat-cover',
      why: `Your answer points to boot or load-area travel, so a cargo-focused protection kit makes more sense than a back-seat-only setup. ${buyer}`,
    };
  }

  if (carMess && smallerVehicle) {
    return {
      primary: 'road-trip-starter-kit',
      addOns: ['pet-hair-removal-brush', 'waterproof-dog-travel-blanket'],
      guide: 'dog-road-trip-checklist-south-africa',
      why: `For hatchbacks and sedans, a clean back-seat setup is usually the most practical starting point. This kit keeps the recommendation focused and easy to use. ${buyer}`,
    };
  }

  if (largerVehicle) {
    return {
      primary: 'suv-protection-kit',
      addOns: ['pet-boot-barrier', 'collapsible-dog-travel-bowl'],
      guide: 'dog-hammock-vs-dog-seat-cover',
      why: `SUVs and bakkies usually benefit from boot-area protection and a tidy travel setup before smaller add-ons. ${buyer}`,
    };
  }

  return {
    primary: 'road-trip-starter-kit',
    addOns: ['collapsible-dog-travel-bowl', 'travel-treat-jar'],
    guide: 'dog-road-trip-checklist-south-africa',
    why: `This is the balanced starter result for cleaner everyday trips: protection, a simple travel bowl and useful packing basics without product overload. ${buyer}`,
  };
}

export function QuizClient({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<AnswerKey, string>>>({});
  const [started, setStarted] = useState(false);
  const [completedTracked, setCompletedTracked] = useState(false);
  const { addItem } = useCart();
  const reduceMotion = useReducedMotion();

  const complete = step >= questions.length;
  const current = questions[Math.min(step, questions.length - 1)];
  const progress = complete ? 100 : ((step + 1) / questions.length) * 100;

  const result = useMemo(() => {
    const slugs = recommendationSlugs(answers);
    const primary = bySlug(products, slugs.primary);
    const addOns = slugs.addOns.map((slug) => bySlug(products, slug));
    const isFeedingSetup = slugs.primary === 'slow-feeder-bowl';
    return {
      primary,
      addOns,
      guide: blogPosts.find((post) => post.slug === slugs.guide),
      why: slugs.why,
      includedProducts: isFeedingSetup ? [primary.name, ...addOns.map((product) => product.name)] : primary.whatsIncluded,
      cartSlugs: isFeedingSetup ? [primary.slug, ...addOns.map((product) => product.slug)] : [primary.slug],
      fullSetupSlugs: [primary.slug, ...addOns.map((product) => product.slug)],
    };
  }, [answers, products]);

  useEffect(() => {
    if (!complete || completedTracked) return;
    trackEvent('quiz_completed', {
      recommended_kit: result.primary.slug,
      guide: result.guide?.slug,
      problem: answers.problem,
      buyer_type: answers.buyerType,
    });
    setCompletedTracked(true);
  }, [answers.buyerType, answers.problem, complete, completedTracked, result.guide?.slug, result.primary.slug]);

  function chooseOption(option: string) {
    if (!started) {
      setStarted(true);
      trackEvent('quiz_started', { first_question: current.field });
    }
    setAnswers((currentAnswers) => ({ ...currentAnswers, [current.field]: option }));
    setStep((value) => value + 1);
  }

  function addRecommendationToCart() {
    result.fullSetupSlugs.forEach((slug) => addItem(slug));
    trackEvent('recommended_kit_added', {
      item_slug: result.primary.slug,
      value: result.fullSetupSlugs.reduce((sum, slug) => sum + bySlug(products, slug).price, 0),
      currency: 'ZAR',
    });
  }

  if (complete) {
    return (
      <motion.div
        className="kitQuizResult kitQuizResultRich"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="kitQuizResultMedia">
          <ProductImage
            src={result.primary.galleryImages[0] ?? result.primary.image}
            alt={getProductImageAlt(result.primary.name, result.primary.category, 'kit finder recommendation')}
            productName={result.primary.name}
            category={result.primary.category}
            className="kitQuizResultImage"
          />
          <div className="kitQuizResultThumbs" aria-label={`${result.primary.name} gallery preview`}>
            {result.primary.galleryImages.slice(0, 3).map((image, index) => (
              <ProductImage
                key={image}
                src={image}
                alt={getProductImageAlt(result.primary.name, result.primary.category, `quiz gallery ${index + 1}`)}
                productName={result.primary.name}
                category={result.primary.category}
                className="kitQuizResultThumb"
              />
            ))}
          </div>
          <div className="kitQuizResultBadge">
            <Sparkles size={15} />
            Best match from your answers
          </div>
          <div className="kitQuizFloatingBenefits">
            {result.primary.bestFor.slice(0, 3).map((item) => (
              <motion.span
                key={item}
                animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShieldCheck size={13} /> {item}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="kitQuizResultCopy">
          <span className="eyebrow">Recommended setup</span>
          <h2>{result.primary.name}</h2>
          <p>{result.primary.shortDescription}</p>

          <div className="kitQuizPriceLine">
            <strong>{formatZar(result.primary.price)}</strong>
            {result.primary.compareAtPrice > result.primary.price ? <span>{formatZar(result.primary.compareAtPrice)}</span> : null}
          </div>

          <div className="fitmentHelpBox">
            <strong>Why this kit matches your answers</strong>
            <p>{result.why}</p>
          </div>

          <div className="kitQuizIncluded">
            <h3>Included products</h3>
            <div className="kitQuizIncludedGrid">
              {result.includedProducts.map((item) => (
                <span key={item}>
                  <CheckCircle2 size={15} /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="kitQuizActions">
            <button type="button" className="button buttonPrimary buttonSheen" onClick={addRecommendationToCart}>
              Add full setup to cart
            </button>
            <Link href={`/shop/product/${result.primary.slug}`} className="button buttonSecondary buttonSheen">
              View full details
            </Link>
            <Link href="/shop/category/travel-kits" className="button buttonGhost">
              Compare another kit
            </Link>
            <button
              type="button"
              className="button buttonGhost"
              onClick={() => {
                setAnswers({});
                setStep(0);
                setStarted(false);
                setCompletedTracked(false);
              }}
            >
              Start again
            </button>
          </div>
        </div>

        <div className="kitQuizResultPanel kitQuizDetailPanel">
          <h3>Best for</h3>
          <div className="kitQuizPillGrid">
            {result.primary.bestFor.map((item) => (
              <span key={item}>
                <CheckCircle2 size={15} /> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="kitQuizResultPanel kitQuizDetailPanel">
          <h3>Quality and materials</h3>
          <p>
            <strong>Material:</strong> {result.primary.material}
          </p>
          <ul className="bulletList">
            {result.primary.qualityNotes.slice(0, 3).map((item) => (
              <li key={item}>
                <CheckCircle2 size={15} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="kitQuizResultPanel kitQuizDetailPanel">
          <h3>How to use it</h3>
          <ul className="bulletList">
            {result.primary.howToUse.slice(0, 3).map((item) => (
              <li key={item}>
                <CheckCircle2 size={15} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="kitQuizResultPanel kitQuizDetailPanel">
          <h3>Delivery and returns</h3>
          <p>{result.primary.deliveryNote}</p>
          <p>{result.primary.returnNote}</p>
          <p>Orders are processed after payment confirmation. Availability is marked as {result.primary.availability.replaceAll('_', ' ')}.</p>
        </div>

        <div className="kitQuizResultPanel kitQuizDetailPanel">
          <h3>FAQs</h3>
          <div className="kitQuizFaqGrid">
            {result.primary.faqs.slice(0, 3).map((faq) => (
              <div key={faq.question}>
                <strong>{faq.question}</strong>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="kitQuizResultPanel">
          <h3>Two recommended add-ons</h3>
          <div className="kitQuizAddOnGrid">
            {result.addOns.map((product) => (
              <div className="kitQuizAddOn" key={product.slug}>
                <ProductImage
                  src={product.image}
                  alt={getProductImageAlt(product.name, product.category, 'kit finder add-on')}
                  productName={product.name}
                  category={product.category}
                  className="kitQuizAddOnImage"
                />
                <div>
                  <strong>{product.name}</strong>
                  <span>{formatZar(product.price)}</span>
                </div>
                <button type="button" className="iconButton" aria-label={`Add ${product.name} to cart`} onClick={() => addItem(product.slug)}>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {result.guide ? (
          <div className="kitQuizGuide">
            <span className="eyebrow">Related guide</span>
            <h3>{result.guide.title}</h3>
            <p>{result.guide.excerpt}</p>
            <Link href={`/blog/${result.guide.slug}`} className="button buttonSecondary buttonSheen">
              Read the guide <ArrowRight size={15} />
            </Link>
          </div>
        ) : null}
      </motion.div>
    );
  }

  return (
    <div className="kitQuizShell">
      <div className="kitQuizTopbar">
        <div>
          <span className="eyebrow">Kit Finder</span>
          <strong>
            Step {step + 1} of {questions.length}
          </strong>
        </div>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="kitQuizProgress" aria-hidden="true">
        <motion.span animate={{ width: `${progress}%` }} transition={{ duration: reduceMotion ? 0 : 0.26, ease: 'easeOut' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.field}
          className="kitQuizCard"
          variants={cardVariants}
          initial={reduceMotion ? false : 'initial'}
          animate={reduceMotion ? undefined : 'animate'}
          exit={reduceMotion ? undefined : 'exit'}
          transition={{ duration: 0.26, ease: 'easeOut' }}
        >
          <div className="kitQuizIcon">{current.icon}</div>
          <span className="kitQuizCardEyebrow">{current.eyebrow}</span>
          <h2>{current.title}</h2>
          <p>{current.subtitle}</p>

          <div className="kitQuizOptions">
            {current.options.map((option) => (
              <motion.button
                type="button"
                key={option}
                className={answers[current.field] === option ? 'kitQuizOption kitQuizOptionActive' : 'kitQuizOption'}
                onClick={() => chooseOption(option)}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <span>{option}</span>
                <ArrowRight size={16} />
              </motion.button>
            ))}
          </div>

          <div className="kitQuizFooter">
            <button type="button" className="button buttonGhost" disabled={step === 0} onClick={() => setStep((value) => Math.max(value - 1, 0))}>
              <ArrowLeft size={15} /> Back
            </button>
            <span>No fake urgency. Just a practical recommendation.</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="kitQuizAnswerRail" aria-label="Selected answers">
        {questions.map((question, index) => (
          <div className={index < step ? 'kitQuizAnswerPill kitQuizAnswerPillDone' : 'kitQuizAnswerPill'} key={question.field}>
            <span>{question.eyebrow}</span>
            <strong>{answers[question.field] ?? 'Waiting'}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
