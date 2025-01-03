"use client";
import { FlexColStart } from "@/components/flex";
import Button from "@/components/ui/button";
import React from "react";
import toast from "react-hot-toast";

export default function GenAIResponses() {
  const [prompt, setPrompt] = React.useState<string>("");
  const [blobUrls, setBlobUrls] = React.useState<string[]>([]);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const generateResponse = async () => {
    if (prompt.length < 1) return;
    const voiceId = "ep8llq73F5oPd4fLOhW9"; //Natasha style
    const options = {
      method: "POST",
      headers: {
        "xi-api-key": "b4dd057279fa6f30a401f78b860f8ea8",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: prompt,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          similarity_boost: 0,
          stability: 0.1,
        },
      }),
    };

    try {
      setLoading(true);
      // const res = await fetch(
      //   `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      //   options
      // );
      const res = await fetch(`http://localhost:2025/api/recognition/tts`, {
        method: "POST",
        body: JSON.stringify({ text: prompt }),
      });
      // const data = await res.arrayBuffer();
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error("An error occured");
        return;
      }
      const audioContent = data.data?.content;
      const binaryAudioData = atob(audioContent);

      // Convert binary data to ArrayBuffer
      const arrayBuffer = new Uint8Array(binaryAudioData.length);
      for (let i = 0; i < binaryAudioData.length; i++) {
        arrayBuffer[i] = binaryAudioData.charCodeAt(i);
      }

      // Create Blob from ArrayBuffer
      const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });

      // Create Object URL from Blob
      const audioUrl = URL.createObjectURL(audioBlob);

      setBlobUrls([...blobUrls, audioUrl]);
      //   audioRef.current!.src = blobUrl;
    } catch (e: any) {
      setLoading(false);
      console.log(e);
      toast.error("An error occured");
    }
  };

  return (
    <FlexColStart className="p-5">
      <h1>Gen AI Responses</h1>
      <p>Generate AI responses to a given prompt.</p>
      <br />
      <textarea
        className="text-dark-100"
        name=""
        id=""
        cols={50}
        rows={10}
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      ></textarea>
      <Button onClick={generateResponse} isLoading={loading}>
        Generate
      </Button>
      {blobUrls.map((url) => (
        <audio key={url} ref={audioRef} src={url} controls />
      ))}
      <br />
    </FlexColStart>
  );
}
