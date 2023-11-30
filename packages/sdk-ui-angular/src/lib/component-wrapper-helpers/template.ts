export const rootId = 'preact';
export const rootContentId = 'preactContent';
export const template = `
    <div #${rootId} style="width: 100%; height: 100%"></div>
`;
export const templateWithContent = `
    <div #${rootId} style="width: 100%; height: 100%">
        <div #${rootContentId} style="width: 100%; height: 100%">
            <ng-content></ng-content>
        </div>
    </div>
`;
