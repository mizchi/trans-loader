export type Context = {
  filename: string;
  url: string;
  originalUrl: string;
  content: string | null;
};

export type Processor = (input: Context) => Promise<Context>;
