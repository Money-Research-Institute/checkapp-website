/**
 * Blocks used only by /how-it-works, /features and /about. Everything here is a server component built on the ds
 * primitives and the dark tokens; the only client code reachable from it is the ds CtaButton / Button / Faq.
 * Copy: copy.ts (the client's wording, read from src/content/copy, plus our marked drafts).
 */
export { AnswerBlock } from './AnswerBlock';
export { CanCannot } from './CanCannot';
export { ComparisonTable } from './ComparisonTable';
export { ConsentCard } from './ConsentCard';
export { CLIENT, PAGES } from './copy';
export { Disclaimer } from './Disclaimer';
export { FeatureRow } from './FeatureRow';
export { FourP } from './FourP';
export { IconCards } from './IconCards';
export type { IconCardItem } from './IconCards';
export { CompassIcon, FaceIcon, IrisIcon, LockIcon, SunIcon, TapIcon, TongueIcon, TrashIcon } from './icons';
export { PhoneShot } from './PhoneShot';
export { ScanCards } from './ScanCards';
export { Steps } from './Steps';
export type { Step } from './Steps';
