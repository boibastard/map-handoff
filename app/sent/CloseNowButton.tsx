"use client";

export default function CloseNowButton() {
  function closeNow() {
    window.close();

    // Fallback if Safari/iPhone refuses to close the tab
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  }

  return (
    <button
      type="button"
      onClick={closeNow}
      className="button-link"
      style={{
        width: "100%",
        cursor: "pointer",
      }}
    >
      You can close this tab now.
    </button>
  );
}