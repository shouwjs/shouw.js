export * from './Interpreter';
export * from './Functions';
export * from './Conditions';
export * from './IF';
export * from './Time';
export * from './Reader';
export * from './Parsers';

// UNESCAPE AND ESCAPE STRING (DON'T TOUCH)
String.prototype.unescape = function () {
    return this.replace(/#RIGHT#/g, '[')
        .replace(/#LEFT#/g, ']')
        .replace(/#SEMI#/g, ';')
        .replace(/#COLON#/g, ':')
        .replace(/#CHAR#/g, '$')
        .replace(/#RIGHT_CLICK#/g, '>')
        .replace(/#LEFT_CLICK#/g, '<')
        .replace(/#EQUAL#/g, '=')
        .replace(/#RIGHT_BRACKET#/g, '{')
        .replace(/#LEFT_BRACKET#/g, '}')
        .replace(/#COMMA#/g, ',')
        .replace(/#LB#/g, '(')
        .replace(/#RB#/g, ')')
        .replace(/#AND#/g, '&&')
        .replace(/#OR#/g, '||');
};

String.prototype.escape = function () {
    return this.replace(/\[/g, '#RIGHT#')
        .replace(/]/g, '#LEFT#')
        .replace(/;/g, '#SEMI#')
        .replace(/:/g, '#COLON#')
        .replace(/\$/g, '#CHAR#')
        .replace(/>/g, '#RIGHT_CLICK#')
        .replace(/</g, '#LEFT_CLICK#')
        .replace(/=/g, '#EQUAL#')
        .replace(/{/g, '#RIGHT_BRACKET#')
        .replace(/}/g, '#LEFT_BRACKET#')
        .replace(/,/g, '#COMMA#')
        .replace(/\(/g, '#LB#')
        .replace(/\)/g, '#RB#')
        .replace(/&&/g, '#AND#')
        .replace(/\|\|/g, '#OR#');
};

// MUST ESCAPE STRING (DON'T TOUCH)
String.prototype.mustEscape = function () {
    return this.replace(/\\\[/g, '#RIGHT#')
        .replace(/\\]/g, '#LEFT#')
        .replace(/\\;/g, '#SEMI#')
        .replace(/\\:/g, '#COLON#')
        .replace(/\\$/g, '#CHAR#')
        .replace(/\\>/g, '#RIGHT_CLICK#')
        .replace(/\\</g, '#LEFT_CLICK#')
        .replace(/\\=/g, '#EQUAL#')
        .replace(/\\{/g, '#RIGHT_BRACKET#')
        .replace(/\\}/g, '#LEFT_BRACKET#')
        .replace(/\\,/g, '#COMMA#')
        .replace(/\\&&/g, '#AND#')
        .replace(/\\\|\|/g, '#OR#');
};

// TO OBJECT, TO URL, TO BOOLEAN (DON'T TOUCH)
String.prototype.toObject = function () {
    try {
        return JSON.parse(this as string);
    } catch {
        return {};
    }
};

String.prototype.toURL = function () {
    try {
        return new URL(this as string).toString();
    } catch {
        return void 0;
    }
};

String.prototype.toBoolean = function () {
    const str = this.toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes') {
        return true;
    }

    if (str === 'false' || str === '0' || str === 'no') {
        return false;
    }

    return false;
};
