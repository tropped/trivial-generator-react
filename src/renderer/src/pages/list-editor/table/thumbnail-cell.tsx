/* eslint-disable react/prop-types */
export const ThumbnailCell = ({ row }) => {
  const { id: videoId } = row.original;

  if (!videoId) {
    return <div className="h-12 w-12 rounded border-2 border-border bg-muted" />;
  }

  return (
    <img
      className="h-12 w-12 rounded border-2 border-border object-cover"
      alt=""
      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
};
