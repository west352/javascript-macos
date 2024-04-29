import './index.scss';
import 'dayjs/locale/zh-cn';

import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import Icon from '../../lib/Icon';

const Header = (): JSX.Element => {
    const timeFormat = 'MMM D, YYYY h:mm A';
    const [time, setTime] = useState(dayjs().format(timeFormat));
    const [showInput, setShowInput] = useState(false);
    const [userName, setUserName] = useState('West Liu');

    useEffect(() => {
        const updateTime = setInterval(() => {
            setTime(dayjs().format(timeFormat));
        }, 60 * 1000);
        return () => clearInterval(updateTime);
    });

    return (
        <header className="Header">
            <div className="HeaderLeft">
                <div>
                    <Icon type="icon-apple" style={{ fontSize: 16 }} />
                </div>
                <div>
                    {showInput ? (
                        <input
                            autoFocus
                            type="text"
                            value={userName}
                            onChange={e => {
                                setUserName(e.target.value);
                            }}
                            onBlur={() => {
                                setShowInput(false);
                            }}
                        />
                    ) : (
                        <span
                            onClick={() => {
                                setShowInput(true);
                            }}
                        >
                            {userName}
                        </span>
                    )}
                </div>
                <div>File</div>
                <div>Edit</div>
                <div>View</div>
                <div>Go</div>
                <div>Window</div>
                <div>Help</div>
            </div>
            <div className="HeaderRight">
                <div>
                    <a
                        href="https://www.linkedin.com/in/west-changjiang-liu-22a378292"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Icon type="icon-ren" style={{ fontSize: 22 }} />
                    </a>
                </div>
                <div>
                    <a
                        href="https://github.com/west352"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Icon type="icon-github" style={{ fontSize: 22 }} />
                    </a>
                </div>
                <div>{time}</div>
            </div>
        </header>
    );
};

export default Header;
