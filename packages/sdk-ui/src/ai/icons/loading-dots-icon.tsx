import gif from './loading-dots.gif';

export default function LoadingDotsIcon() {
  return (
    <img
      src={gif}
      alt="Please wait while AI responds..."
      className="csdk-w-[30px] csdk-opacity-70"
    />
  );
}
