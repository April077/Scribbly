"use client";

import React from "react";
import { RecoilRoot } from "recoil";

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <RecoilRoot>{children}</RecoilRoot>
    </div>
  );
};

export default ContextProvider;
