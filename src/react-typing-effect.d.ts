declare module 'react-typing-effect' {
    import * as React from 'react';

    interface ReactTypingEffectProps {
        text: string[] | string;
        speed?: number;
        eraseSpeed?: number;
        eraseDelay?: number;
        typingDelay?: number;
        className?: string;
        cursorClassName?: string;
        displayTextRenderer?: (text: string, i: number) => React.ReactNode;
    }

    class ReactTypingEffect extends React.Component<ReactTypingEffectProps, any> {}

    export default ReactTypingEffect;
}
