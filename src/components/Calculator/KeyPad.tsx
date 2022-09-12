import './index.scss';

import React, { useCallback, useState } from 'react';

const KEYS = [
    'AC',
    '+/-',
    '%',
    '÷',
    '7',
    '8',
    '9',
    '×',
    '4',
    '5',
    '6',
    '-',
    '1',
    '2',
    '3',
    '+',
    '0',
    '.',
    '=',
];

const KeyPad: React.FC = (): JSX.Element => {
    const [keys, setKeys] = useState<string[]>(KEYS);
    const [operands, setOperands] = useState({ operand1: '', operand2: '' });
    const [operator, setOperator] = useState<string>('');
    const [result, setResult] = useState<string>('0');

    // e.g. covert 70000000 to 7e+7
    // e.g. convert 0.0000007 to 7e-7
    const convertToScientificNotation = (text: string): string => {
        text = /\.\d+?0+$/g.test(text) ? text.replace(/0+$/g, '') : text;
        return text
            .replace(/\.0+$/g, '')
            .replace(/\.0+e/, 'e')
            .replace(/0+e/, 'e')
            .replace(/\.$/, '');
    };

    const addNewDigitToOperand = useCallback(
        (operand: 'operand1' | 'operand2', newDigit: string): void => {
            const updatedOperands = {
                operand1:
                    operand === 'operand1' &&
                    (operands[operand] !== '0' || newDigit === '.')
                        ? operands[operand] + newDigit
                        : operands.operand1,
                operand2:
                    operand === 'operand2' &&
                    (operands[operand] !== '0' || newDigit === '.')
                        ? operands[operand] + newDigit
                        : operands.operand2,
            };
            setOperands(updatedOperands);
            setResult(
                updatedOperands[operand].length > 6
                    ? convertToScientificNotation(
                          parseFloat(updatedOperands[operand]).toPrecision(6)
                      )
                    : updatedOperands[operand]
            );
        },
        [operands]
    );

    const evaluateResult = useCallback(
        (operand1: string, operand2: string, operator: string) => {
            const parsedOperand1 = parseFloat(operand1);
            const parsedOperand2 = parseFloat(operand2);

            if (operator === '+') {
                return (parsedOperand1 + parsedOperand2).toPrecision(6);
            } else if (operator === '-') {
                return (parsedOperand1 - parsedOperand2).toPrecision(6);
            } else if (operator === '×') {
                return (parsedOperand1 * parsedOperand2).toPrecision(6);
            } else if (operator === '÷') {
                if (parsedOperand2 === 0) {
                    return 'NaN';
                } else return (parsedOperand1 / parsedOperand2).toPrecision(6);
            } else if (operator === '+/-') {
                return (-(parsedOperand1 || parsedOperand2) || 0).toPrecision(6);
            } else {
                //(operator === "%")
                return ((parsedOperand1 || parsedOperand2) / 100 || 0).toPrecision(
                    6
                );
            }
        },
        [result]
    );

    const handleClickButton = useCallback(
        (e): void => {
            if (e.target instanceof HTMLButtonElement) {
                const pressedButton = e.target.textContent;
                if ('0123456789.'.includes(pressedButton)) {
                    const keys = [...KEYS];
                    keys.shift();
                    keys.unshift('C');
                    setKeys(keys);
                    if (operator === '') {
                        addNewDigitToOperand('operand1', pressedButton);
                    } else {
                        addNewDigitToOperand('operand2', pressedButton);
                    }
                } else if ('+-×÷'.includes(pressedButton)) {
                    setOperands(operands => {
                        return {
                            operand1: operands.operand1 ? operands.operand1 : result,
                            operand2: operands.operand2,
                        };
                    });
                    setOperator(pressedButton);
                } else if (['+/-', '%'].includes(pressedButton)) {
                    const prevOperand1 = operands.operand1;
                    const prevOperand2 = operands.operand2;
                    if (operator === '') {
                        setOperands(operands => ({
                            ...operands,
                            operand1: evaluateResult(
                                prevOperand1,
                                prevOperand2,
                                pressedButton
                            ),
                        }));
                        setResult(
                            convertToScientificNotation(
                                evaluateResult(
                                    prevOperand1,
                                    prevOperand2,
                                    pressedButton
                                )
                            )
                        );
                    } else if (operator && prevOperand1 && prevOperand2) {
                        setOperands(operands => ({
                            ...operands,
                            operand2: evaluateResult(
                                '',
                                prevOperand2,
                                pressedButton
                            ),
                        }));
                        setResult(evaluateResult('', prevOperand2, pressedButton));
                    } else if (operator && prevOperand1 && prevOperand2 === '') {
                        setOperands(operands => ({
                            ...operands,
                            operand2: evaluateResult(
                                prevOperand1,
                                '',
                                pressedButton
                            ),
                        }));
                        setResult(evaluateResult(prevOperand1, '', pressedButton));
                    }
                } else if (pressedButton === 'C') {
                    const keys = [...KEYS];
                    keys.shift();
                    keys.unshift('AC');
                    setKeys(keys);
                    if (operator === '' && operands.operand1 !== '') {
                        setOperands(operands => ({ ...operands, operand1: '' }));
                        setResult('0');
                    } else if (operator && operands.operand2 === '') {
                        setOperator('');
                    } else if (operands.operand2) {
                        setOperands(operands => ({ ...operands, operand2: '' }));
                        setResult('0');
                    }
                } else if (pressedButton === '=') {
                    if (operands.operand1 && operator && operands.operand2) {
                        setResult(
                            convertToScientificNotation(
                                evaluateResult(
                                    operands.operand1,
                                    operands.operand2,
                                    operator
                                )
                            )
                        );
                        setOperands({ operand1: '', operand2: '' });
                        setOperator('');
                    } else if (
                        operands.operand1 &&
                        operator &&
                        operands.operand2 === ''
                    ) {
                        setResult(
                            convertToScientificNotation(
                                evaluateResult(
                                    operands.operand1,
                                    operands.operand1,
                                    operator
                                )
                            )
                        );
                        setOperands({ operand1: '', operand2: '' });
                        setOperator('');
                    }
                } else if (pressedButton === 'AC') {
                    setOperands({ operand1: '', operand2: '' });
                    setOperator('');
                    setResult('0');
                }
            }
        },
        [operator, operands, result, addNewDigitToOperand, evaluateResult]
    );

    return (
        <div className="calculator-wrapper">
            <div className="output-wrapper">
                <div className="output">
                    <span>{result}</span>
                </div>
            </div>
            <div className="row" onClick={(e): void => handleClickButton(e)}>
                {keys.map((text, index) => {
                    return (
                        <button
                            className={
                                [0, 1, 2].includes(index)
                                    ? 'dark button text-'
                                    : [3, 7, 11, 15, 18].includes(index)
                                    ? 'orange button text-'
                                    : 'button text-' + text
                            }
                            key={text}
                        >
                            {text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default KeyPad;
