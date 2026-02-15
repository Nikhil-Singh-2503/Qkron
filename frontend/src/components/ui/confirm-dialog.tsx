import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCallback, useState } from 'react';

interface ConfirmOptions {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

// Hook for managing confirm dialog state
export function useConfirm() {
    const [options, setOptions] = useState<ConfirmOptions>({
        title: 'Confirm',
        description: 'Are you sure?',
    });
    const [open, setOpen] = useState(false);
    const [promiseResolve, setPromiseResolve] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        setOptions(options);
        setOpen(true);
        return new Promise((resolve) => {
            setPromiseResolve(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        if (promiseResolve) {
            promiseResolve(true);
            setPromiseResolve(null);
        }
        setOpen(false);
    };

    const handleCancel = () => {
        if (promiseResolve) {
            promiseResolve(false);
            setPromiseResolve(null);
        }
        setOpen(false);
    };

    const ConfirmDialog = () => (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{options.title}</DialogTitle>
                    <DialogDescription>{options.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        {options.cancelText || 'Cancel'}
                    </Button>
                    <Button
                        variant={options.variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                    >
                        {options.confirmText || 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return { confirm, ConfirmDialog };
}
