import { vsprintf } from 'sprintf-js';

interface Options {
  languages?: string[] | string;
}

class i18n {
  data: any;
  languages: string[];

  constructor(options: Options = {}) {
    this.data = {};
    this.languages = options.languages as any || ['default'];

    if (!Array.isArray(this.languages)) {
      this.languages = [this.languages];
    }
  }

  get(languages?: string[] | string) {
    const { data } = this;
    const result = {};

    if (languages) {
      if (!Array.isArray(languages)) {
        languages = [languages];
      }
    } else {
      languages = this.languages;
    }

    languages.forEach(lang => {
      const langData = data[lang];

      if (langData) {
        Object.keys(langData).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(result, key)) {
            result[key] = langData[key];
          }
        });
      }
    });

    return result;
  }

  set(lang: string, data: object) {
    if (typeof lang !== 'string') throw new TypeError('lang must be a string!');
    if (typeof data !== 'object') throw new TypeError('data is required!');

    this.data[lang] = flattenObject(data);

    return this;
  }

  remove(lang: string) {
    if (typeof lang !== 'string') throw new TypeError('lang must be a string!');

    delete this.data[lang];

    return this;
  }

  list() {
    return Object.keys(this.data);
  }

  __(lang?: string | string[]) {
    const data = this.get(lang);

    return (key?: string, ...args) => {
      if (!key) return '';

      const str = data[key] || key;

      return vsprintf(str, args);
    };
  }

  _p(lang?: string | string[]) {
    const data = this.get(lang);

    return (key?: string, ...args) => {
      if (!key) return '';

      const number = args.length ? +args[0] : 0;
      let str = key;

      if (!number && Object.prototype.hasOwnProperty.call(data, `${key}.zero`)) {
        str = data[`${key}.zero`];
      } else if (number === 1 && Object.prototype.hasOwnProperty.call(data, `${key}.one`)) {
        str = data[`${key}.one`];
      } else if (Object.prototype.hasOwnProperty.call(data, `${key}.other`)) {
        str = data[`${key}.other`];
      } else if (Object.prototype.hasOwnProperty.call(data, key)) {
        str = data[key];
      }

      return vsprintf(str, args);
    };
  }
}

function flattenObject(data, obj = {}, parent = '') {
  Object.keys(data).forEach(key => {
    const item = data[key];

    if (typeof item === 'object') {
      flattenObject(item, obj, `${parent + key}.`);
    } else {
      obj[parent + key] = item;
    }
  });

  return obj;
}

export = i18n;
