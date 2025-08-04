import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AI() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate("/ai-redesigned");
  }, [navigate]);
  
  return null;
}