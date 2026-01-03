import clsx from "clsx";

const toneStyles = {
  neutral: "bg-white/70 text-ink-900",
  positive: "bg-mint-500/15 text-ink-900",
  negative: "bg-coral-500/15 text-ink-900"
};

type StatCardProps = {
  label: string;
  value: string;
  subtext?: string;
  tone?: keyof typeof toneStyles;
};

const StatCard = ({ label, value, subtext, tone = "neutral" }: StatCardProps) => {
  return (
    <div
      className={clsx(
        "glass-panel flex min-h-[190px] flex-col justify-between rounded-3xl p-6 shadow-card sm:min-h-[210px] sm:p-7 lg:min-h-[230px] lg:p-8",
        toneStyles[tone]
      )}
    >
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-ink-600">
          {label}
        </p>
        <p className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-900 sm:text-3xl">
          {value}
        </p>
      </div>
      {subtext ? <p className="text-sm text-ink-600">{subtext}</p> : null}
    </div>
  );
};

export default StatCard;
