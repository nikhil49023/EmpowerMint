
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission errors that includes
 * additional context about the request that was denied. This is used
* to provide more detailed error messages during development.
 */
export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const prettyContext = JSON.stringify(context, null, 2);
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules: \n${prettyContext}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is necessary to make the error message visible in the Next.js dev overlay
    // when the error is thrown from a client component.
    this.stack = '';
  }
}
