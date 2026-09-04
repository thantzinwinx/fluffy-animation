type CanvasRenderPolicyInput = {
  documentHidden: boolean;
  revealed: boolean;
};

export function shouldRunCanvas({
  documentHidden,
  revealed,
}: CanvasRenderPolicyInput): boolean {
  return revealed && !documentHidden;
}
