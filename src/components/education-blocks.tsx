import Link from 'next/link';
import type { EducationBlock } from '@/lib/education';

export function EducationBlocks({ blocks }: { blocks: EducationBlock[] }) {
  if (!blocks.length) return null;

  return (
    <div className="educationGrid">
      {blocks.map((block) => (
        <article className="contentCard educationBlock" key={block.title}>
          <h3>{block.title}</h3>
          <p>{block.summary}</p>
          <div className="comparisonTable" role="table" aria-label={block.title}>
            <div className="comparisonRow comparisonHead" role="row">
              <span>Option</span>
              <span>Best for</span>
              <span>Consider</span>
            </div>
            {block.rows.map((row) => (
              <div className="comparisonRow" role="row" key={row.option}>
                <strong>{row.option}</strong>
                <span>{row.bestFor}</span>
                <span>{row.consider}</span>
              </div>
            ))}
          </div>
          {block.guideHref ? (
            <Link href={block.guideHref} className="button buttonGhost buttonSmall">
              Read guide
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
