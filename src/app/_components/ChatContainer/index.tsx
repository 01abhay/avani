"use client";
/* eslint-disable @typescript-eslint/dot-notation */
import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

import Avatar from "./Avatar";
import styles from "./index.module.css";
import { ProductRowSelect } from "~/server/db/schema";

export function ChatContainer() {
  const utils = api.useUtils();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    {
      role: string;
      content: string;
      products?: Pick<
        ProductRowSelect,
        "id" | "description" | "name" | "images"
      >[];
    }[]
  >([]);

  return (
    <div className={styles["chat-container"]}>
      <div style={{ display: "flex", gap: 12 }}>
        <div className={styles["chat-bubble"]}>
          <p className={styles["bot-message"]}>
            I am Avani, how can I help you?
          </p>
          {messages.map((m) => (
            <div key={m.content}>
              <p key={m.content} className={styles[`${m.role}-message`]}>
                {m.content}
              </p>
              <div>
                {m.products && (
                  <div className={styles["product-grid"]}>
                    {m.products.map((p) => (
                      <div key={p.id} className={styles["product"]}>
                        <img src={(p.images as string[])[0]} alt={p.name!} />
                        <p className={styles["productName"]} style={{}}>
                          {p.name}
                        </p>
                        <button className={styles.button}>Add to Cart</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* <p className={styles["user-message"]}>
          Oh lovely! are there any offers?{" "}
          <span className={styles["emoji"]}>🤔</span>
        </p> */}
        </div>

        <Avatar   />
      </div>
      <div className={styles["footer"]}>
        <button className={styles["voice-button"]}>🎤</button>
        <input
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className={styles["voice-button"]}
          onClick={() =>
            utils.ai.getProductSuggestion
              .fetch({ message: input })
              .then((res) => {
                setInput("");

                setMessages((m) => [
                  ...m,
                  { role: "user", content: input },
                  {
                    role: "bot",
                    content: res.content!,
                    products: res.products,
                  },
                ]);
                const msg = new SpeechSynthesisUtterance();
                const voice = window.speechSynthesis
                  .getVoices()
                  .filter(function (voice) {
                    return voice.name == "Google UK English Female";
                  })[0]!;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                msg.voice = voice;
                msg.text = res.content ?? "Something went wrong!";
                speechSynthesis.speak(msg);
              })
          }
        >
          Send
        </button>
      </div>
    </div>
  );
}
