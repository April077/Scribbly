import { atom } from "recoil";

const lineWidthState = atom({
  key: "lineWidthState",
  default: 5,
});

export default lineWidthState;
