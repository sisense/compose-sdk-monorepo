import loadingDotsGifBase64 from './loading-dots-gif-base64';

export default function LoadingDotsIcon() {
  return (
    <img
      src={loadingDotsGifBase64}
      alt="Please wait while AI responds..."
      className="csdk-w-[30px] csdk-opacity-70"
    />
  );
}
