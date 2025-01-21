import { VercelRequest, VercelResponse } from '@vercel/node';
import hello from '../hello';

describe('hello API', () => {
  it('should respond with "Hello World!" when no name is provided', () => {
    const req = { query: {} } as Partial<VercelRequest> as VercelRequest;

    const setHeaderMock = jest.fn(); // Mock setHeader
    const jsonMock = jest.fn();
    const res = {
      setHeader: setHeaderMock,
      json: jsonMock,
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    } as unknown as VercelResponse;

    hello(req, res);

    expect(setHeaderMock).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS'
    );
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Hello World!',
    });
  });

  it('should respond with "Hello [name]!" when a name is provided', () => {
    const req = { query: { name: 'Alice' } } as Partial<VercelRequest> as VercelRequest;

    const setHeaderMock = jest.fn();
    const jsonMock = jest.fn();
    const res = {
      setHeader: setHeaderMock,
      json: jsonMock,
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    } as unknown as VercelResponse;

    hello(req, res);

    expect(setHeaderMock).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS'
    );
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Hello Alice!',
    });
  });
});
