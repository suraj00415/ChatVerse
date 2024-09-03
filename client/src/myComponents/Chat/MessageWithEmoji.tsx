import React from 'react';
import { Emoji, EmojiStyle } from "emoji-picker-react";
import emojiRegex from 'emoji-regex';

function emojiToUnified(emoji) {
    return Array.from(emoji)
        .map(char => char.codePointAt(0).toString(16))
        .join('-');
}

function isEmoji(str) {
    for (let i = 0; i < str?.length; i++) {
        if (str.charCodeAt(i) > 127) {
            return true;
        }
    }
    return false;
}
function isEmoji2(str) {
    const regex = emojiRegex();
    return regex.test(str);
    // return regexExp.test(str)
}
const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

export const MessageWithEmojis = ({ message, isSmall = true, isHeading = false, isReplyContent = false }) => {
    const parts = message?.split(' ')?.map((part, index) => {
        if (part.match(URL_REGEX)) {
            return (
                <a key={index} target='_blank' rel='noopener noreferrer' className='text-sky-400' href={part}>
                    {part}
                </a>
            );
        } else if (isEmoji2(part)) {
            return part.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/).map((smallPart, i) => {
                const emojiUnified = emojiToUnified(smallPart);
                if (isEmoji2(smallPart)) {
                    return (
                        <span key={`${index}-${i}`} className='inline-block align-middle'>
                            <Emoji
                                size={isHeading ? 19 : 23}
                                unified={emojiUnified}
                                emojiStyle={EmojiStyle.FACEBOOK}
                            />
                        </span>
                    );
                } else {
                    return <React.Fragment key={`${index}-${i}`}>{smallPart}</React.Fragment>;
                }
            });
        } else {
            return <React.Fragment key={index}>{' ' + part}</React.Fragment>;
        }
    });

    if (isEmoji(message) && message?.length === 2 && !isSmall) {
        const emojiUnified = emojiToUnified(message);
        return (
            <Emoji
                key={Math.random()}
                size={60}
                unified={emojiUnified}
                emojiStyle={EmojiStyle.FACEBOOK}
            />
        );
    } else {
        // console.log(parts?.length, typeof parts, parts?.flat(3))
        let isA = false;
        return (
            <div className="items-center" style={{ wordBreak: "break-word" }}>
                {isHeading ?
                    <div className=''>
                        {parts?.flat(3)?.map((part, i) => {
                            if (i <= 7) {
                                if (part?.type === "a") {
                                    isA = true
                                    return <a>{part?.props?.children.substr(0, 20 - i)}</a>
                                }
                                else if (!isA) return part
                            }
                        })}
                        {parts?.flat(3)?.length > 7 || isA ? " ..." : ""}
                    </div>
                    : isReplyContent ?
                        <div>
                            {parts?.flat(3)?.map((part, i) => { if (i <= 50) { return part } })}
                            {parts?.flat(3)?.length > 50 ? " ..." : ""}
                        </div>
                        :
                        parts}
            </div>
        );
    }
};
