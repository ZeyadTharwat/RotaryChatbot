import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { createUserMessage } from "../../../utils/helpers";
import AppContext from "../../AppContext";
import {
  addMessage,
  toggleBotTyping,
  toggleUserTyping,
  fetchBotResponse,
} from "../Messages/messageSlice";
import axios from "axios";

const Textarea = styled.textarea`
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Keypad = () => {
  const dispatch = useDispatch();
  const theme = useContext(AppContext);
  const [userInput, setUserInput] = useState("");
  const userTypingPlaceholder = useSelector(
    (state) => state.messageState.userTypingPlaceholder
  );

  const userTyping = useSelector((state) => state.messageState.userTyping);
  const { rasaServerUrl, userId, textColor } = theme;

  const handleSubmit = async () => {
    if (userInput.length > 0) {
      // Dispatch user message immediately
      dispatch(addMessage(createUserMessage(userInput.trim())));

      // Clear user input
      setUserInput("");

      // Show typing indicator
      dispatch(toggleUserTyping(false));
      dispatch(toggleBotTyping(true));

      try {
        const response = await axios.post(`https://ilegal-rasa.solutions/ask_rotary`, {
          message: userInput.trim(),
        });

        const botMessages = response.data.map((item) => ({
          text: item.text,
          type: "text",
          sender: "BOT",
          ts: new Date().toISOString(),
        }));

        // Dispatch bot messages
        botMessages.forEach((botMessage) => {
          dispatch(addMessage(botMessage));
        });

        console.log("Message sent successfully:", response.data);
      } catch (error) {
        console.error("Error sending message:", error);
        // Handle error as needed
      } finally {
        // Hide typing indicator
        dispatch(toggleBotTyping(false));
        // Re-enable user typing
        dispatch(toggleUserTyping(true));
      }
    }
  };

  return (
    <div className="mt-auto flex h-[12%] items-center rounded-t-3xl bg-slate-50">
      <Textarea
        rows="1"
        className={`mx-4 block w-full resize-none bg-slate-50 p-2.5 text-sm text-gray-900 outline-none ${
          userTyping ? "cursor-default" : "cursor-not-allowed"
        }`}
        placeholder={userTypingPlaceholder}
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        readOnly={!userTyping}
      />
      <button
        type="submit"
        className={`${
          userInput.trim().length > 1 ? "cursor-default" : "cursor-not-allowed"
        } inline-flex justify-center rounded-full p-2 hover:bg-slate-100`}
        style={{ color: textColor }}
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <PaperAirplaneIcon className="h-6 w-6 -rotate-45 stroke-[1.1px]" />
      </button>
    </div>
  );
};
