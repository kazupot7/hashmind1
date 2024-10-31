"use client";
import {
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartCenter,
} from "@/components/flex";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataContext } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import {
  CheckCheck,
  ChevronDown,
  ChevronRight,
  MoveLeft,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Settings() {
  const { showToolBar, setActivePage } = useDataContext();
  const [authVisi, setAuthVisi] = React.useState<boolean>(false);

  const toggleAuthVisi = () => setAuthVisi(!authVisi);

  React.useEffect(() => {
    showToolBar();
    setActivePage("settings");
  }, []);
  return (
    <FlexColStart className="w-full h-full">
      <FlexColStart className="w-full px-4 py-4">
        <Link href="/dashboard/home">
          <MoveLeft
            className="text-white-100 p-2 rounded-md bg-dark-100 "
            size={30}
          />
        </Link>
        <span className="font-ppSB text-lg text-white-100">Settings</span>
      </FlexColStart>

      {/* main */}
      <FlexColStart className="w-full px-4 py-1 ">
        <FlexColStart className="w-full h-auto bg-dark-200 rounded-lg px-4 py-3 gap-0 transition-all">
          <button className="w-full" onClick={toggleAuthVisi}>
            <FlexRowCenterBtw className="w-full">
              <FlexRowStartCenter>
                <Image
                  src="/images/logos/hashnode.png"
                  width={30}
                  height={30}
                  alt="hashnode"
                  className="rounded-md scale-[.95] "
                />
                <span className="font-ppReg text-sm text-white-100 flex items-center justify-start gap-3">
                  Authorize Hashnode{" "}
                  {false ? (
                    <CheckCheck size={15} className="text-green-400" />
                  ) : (
                    <ShieldAlert size={15} className="text-red-305" />
                  )}
                </span>
              </FlexRowStartCenter>
              <ChevronRight
                size={15}
                className={cn(
                  "text-white-100 transition-all",
                  authVisi && "transform rotate-90"
                )}
              />
            </FlexRowCenterBtw>
          </button>
          <FlexColStart
            className={cn(
              "w-full transition-all overflow-hidden p-0 gap-0",
              authVisi ? "h-auto mt-3" : "h-[0px] mt-0"
            )}
          >
            <span className="text-white-100/50 text-xs font-ppReg mb-2">
              Your hashnode token{" "}
              <a
                className="text-blue-101 underline"
                href="https://hashnode.com/settings/developer"
                target="_blank"
              >
                click here
              </a>
            </span>
            <Input
              placeholder="Hashnode Token: xxxx-xx-xxxx-xxxx-xxxxxx"
              className="w-full font-ppReg text-xs bg-dark-105 text-white-100 border-dark-200/10 outline-none focus-visible:ring-0 focus-visible:border-dark-200/20"
            />
            <Button className="w-full h-[40px] mt-2 text-xs bg-blue-100 rounded-md font-ppReg">
              Authorize
            </Button>
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </FlexColStart>
  );
}
