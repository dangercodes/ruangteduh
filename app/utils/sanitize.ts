import xss from 'xss';

const xssOptions = {
    whiteList: {}, // Empty whitelist means ALL HTML tags are stripped
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
};

const myxss = new xss.FilterXSS(xssOptions);

export const sanitizeClientInput = (text: string | null | undefined): string => {
    if (!text) return '';
    return myxss.process(text);
};
