interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />;
};
