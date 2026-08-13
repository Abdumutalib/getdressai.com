import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #9f6d3f 0%, #5d432d 100%)",
          color: "#fff8e9",
          fontSize: 120,
          fontWeight: 900,
          letterSpacing: -3,
        }}
      >
        AK
      </div>
    ),
    {
      ...size,
    }
  );
}
