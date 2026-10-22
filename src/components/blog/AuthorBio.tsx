import { GlassCard } from '@/components/ds/GlassCard';
import { withBasePath } from '@/lib/paths';
import styles from './AuthorBio.module.css';

type AuthorBioProps = {
  name: string;
  role: string;
  imageSrc?: string;
  checkedBy?: string;
};

/** Byline card at the end of an article: photo (or initial), name, role and who checked the piece. */
export function AuthorBio({ name, role, imageSrc, checkedBy }: AuthorBioProps) {
  return (
    <GlassCard as="section" aria-label="About the author" className={styles.bio}>
      <div className={styles.row}>
        {imageSrc ? (
          // 72px avatar from a small WebP (public/pages/blog). Decorative: the name sits right beside it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.avatar}
            src={withBasePath(imageSrc)}
            width={72}
            height={72}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className={styles.initial} aria-hidden="true">
            {name.charAt(0)}
          </span>
        )}
        <div className={styles.who}>
          <p className={styles.kicker}>Written by</p>
          <p className={styles.name}>{name}</p>
          <p className={styles.role}>{role}</p>
        </div>
      </div>
      {checkedBy ? (
        <p className={styles.checked}>
          Checked by: <strong>{checkedBy}</strong>
        </p>
      ) : null}
    </GlassCard>
  );
}
