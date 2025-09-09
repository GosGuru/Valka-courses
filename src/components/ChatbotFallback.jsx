import React from "react";
import { MessageCircle, Loader } from "lucide-react";

const ChatbotFallback = ({ onClick, loading = false }) => {
  const styles = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "64px",
    height: "64px",
    backgroundColor: "hsl(45, 68%, 53%)", // Dorado original de VALKA
    border: "2px solid hsl(45, 68%, 43%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    zIndex: 9999,
    color: "hsl(0, 0%, 4%)", // Negro para contraste
    fontSize: "24px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  };

  const handleMouseEnter = (e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 6px 25px rgba(0, 0, 0, 0.4)";
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
  };

  const iconsChat = {
    loaded: <MessageCircle />,
    loading: <Loader className="animate-spin" />,
  };

  return (
    <div
      onClick={onClick}
      style={styles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={loading ? "Cargando chatbot..." : "Chat con VALKA"}
    >
      {loading
        ? //   Loadin
          iconsChat.loading
        : //Cargado
          iconsChat.loaded}
    </div>
  );
};

export default ChatbotFallback;
