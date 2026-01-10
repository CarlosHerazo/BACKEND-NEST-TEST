/**
 * Result Type for Railway Oriented Programming
 * Represents either a success or failure result
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value: T | null,
    private readonly _error: E | null,
  ) {}

  /**
   * Creates a successful result
   */
  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, null);
  }

  /**
   * Creates a failed result
   */
  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, null, error);
  }

  /**
   * Checks if the result is successful
   */
  get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Checks if the result is a failure
   */
  get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Gets the value (throws if failure)
   */
  getValue(): T {
    if (!this._isSuccess || this._value === null) {
      throw new Error('Cannot get value from a failed result');
    }
    return this._value;
  }

  /**
   * Gets the error (throws if success)
   */
  getError(): E {
    if (this._isSuccess || this._error === null) {
      throw new Error('Cannot get error from a successful result');
    }
    return this._error;
  }

  /**
   * Maps the value if successful
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess && this._value !== null) {
      return Result.ok(fn(this._value));
    }
    return Result.fail(this._error!);
  }

  /**
   * Chains another operation if successful (flatMap)
   */
  bind<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess && this._value !== null) {
      return fn(this._value);
    }
    return Result.fail(this._error!);
  }

  /**
   * Executes a function on the value if successful (for side effects)
   */
  tap(fn: (value: T) => void): Result<T, E> {
    if (this._isSuccess && this._value !== null) {
      fn(this._value);
    }
    return this;
  }

  /**
   * Executes a function on the error if failed (for side effects)
   */
  tapError(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure && this._error !== null) {
      fn(this._error);
    }
    return this;
  }

  /**
   * Handles both success and failure cases
   */
  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this._isSuccess && this._value !== null) {
      return onSuccess(this._value);
    }
    if (this._error !== null) {
      return onFailure(this._error);
    }
    throw new Error('Invalid Result state');
  }
}
