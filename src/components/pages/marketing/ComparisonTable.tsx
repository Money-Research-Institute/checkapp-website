import styles from './ComparisonTable.module.css';

/**
 * A yearly checkup next to a checkapp check-in. It is a fair table, not a scoreboard: the checkup wins the row that matters most
 * ("medical advice"), and the page says plainly that checkapp does not replace a doctor. No competitor is named, nothing is
 * rated, and every checkapp cell says only what the client's copy says (a photo you choose to take, a short wellness insight,
 * not a medical device). DRAFT wording.
 *
 * Three columns on wide screens. Below 700px each row becomes a small card (the feature as its heading, then one labelled
 * line per column) so nothing scrolls sideways at 320px; the labels come from `data-label`.
 */
const COLUMNS = ['A yearly checkup', 'checkapp'] as const;

const ROWS = [
  { feature: 'How often', cells: ['Once a year, if that', 'Any day you take a photo'] },
  { feature: 'Where', cells: ['At a clinic, by appointment', 'On your phone, when you choose'] },
  { feature: 'What you get', cells: ["A clinician's assessment", 'A short wellness insight in plain language'] },
  { feature: 'Medical advice', cells: ['Yes, from a qualified clinician', 'No. checkapp is not a medical device'] },
] as const;

export function ComparisonTable() {
  return (
    <div className={styles.wrap} data-fx="rise">
      <table className={styles.table}>
        <caption className={styles.sr}>A yearly checkup next to a daily check-in with checkapp</caption>
        <thead className={styles.thead}>
          <tr className={styles.row}>
            <th scope="col" className={styles.feature}>
              <span className={styles.sr}>What we compare</span>
            </th>
            {COLUMNS.map((column, index) => (
              <th key={column} scope="col" className={`${styles.head} ${index === 1 ? styles.us : ''}`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.body}>
          {ROWS.map((row) => (
            <tr key={row.feature} className={styles.row}>
              <th scope="row" className={styles.rowHead}>
                {row.feature}
              </th>
              {row.cells.map((cell, index) => (
                <td key={COLUMNS[index]} className={`${styles.cell} ${index === 1 ? styles.us : ''}`} data-label={COLUMNS[index]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
