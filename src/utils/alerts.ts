import Swal, { type SweetAlertOptions } from "sweetalert2";

export const swalStyle: SweetAlertOptions = {
  allowOutsideClick: false,
  backdrop: false,
  customClass: {
    popup: "swal-popup dark-mode",
    actions: "swal-actions",
    confirmButton: "swal-confirm-button",
    cancelButton: "swal-cancel-button",
    title: "swal-title dark-mode",
    htmlContainer: "swal-html-container dark-mode",
  },
  showClass: {
    popup: "animate__animated animate__slideInDown animate__faster",
  },
  hideClass: {
    popup: "animate__animated animate__fadeOutUp animate__faster",
  },
};

// resolves true only when the user explicitly clicks "Delete"
export async function confirmDelete(title: string): Promise<boolean> {
  const result = await Swal.fire({
    ...swalStyle,
    title,
    position: "top",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
}

// resolves to the password typed, or null if cancelled
export async function askPassword(
  title: string,
  confirmButtonText: string,
): Promise<string | null> {
  const result = await Swal.fire({
    ...swalStyle,
    title,
    position: "top",
    input: "password",
    inputPlaceholder: "Password",
    inputValidator: (value) => (value ? null : "Please enter your password"),
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed ? (result.value as string) : null;
}

export function handleError(text: string): void {
  Swal.fire({
    ...swalStyle,
    title: "Something went wrong",
    text,
    position: "top",
    confirmButtonText: "Close",
  });
}

// shows a failed action's error to the user
export function reportError(error: unknown): void {
  console.error(error);
  handleError(error instanceof Error ? error.message : String(error));
}

export function handleSuccess(title: string): void {
  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    icon: "success",
    title,
  });
}
