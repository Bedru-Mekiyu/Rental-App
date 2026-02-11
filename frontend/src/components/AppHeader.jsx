import React from "react";

export default function AppHeader({ title }) {
  return (
    <div class="fixed top-0 left-0 right-0 flex justify-between items-center bg-white p-3 shadow-md">
      <h1 class="text-lg font-semibold">{title}</h1>
      <img
        src="https://i.pravatar.cc/40"
        alt="Profile"
        class="w-10 h-10 rounded-full"
      />

    </div>
  );
}
