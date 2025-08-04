
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import LeadForm from '@/components/forms/lead-form';
import PropertyForm from '@/components/forms/property-form';
import TaskForm from '@/components/forms/task-form';
import DealForm from '@/components/forms/deal-form';

interface GlobalModalsProps {
  isOpen: boolean;
  type: 'lead' | 'property' | 'task' | 'deal' | null;
  onClose: () => void;
}

export function GlobalModals({ isOpen, type, onClose }: GlobalModalsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const titles = {
    lead: 'Add New Lead',
    property: 'Add New Property',
    task: 'Add New Task',
    deal: 'Add New Deal'
  };

  const renderForm = () => {
    switch (type) {
      case 'lead':
        return <LeadForm onSuccess={onClose} />;
      case 'property':
        return <PropertyForm onSuccess={onClose} />;
      case 'task':
        return <TaskForm onSuccess={onClose} />;
      case 'deal':
        return <DealForm onSuccess={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{type ? titles[type] : 'Add New'}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing global modals
export function useGlobalModals() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'lead' | 'property' | 'task' | 'deal' | null;
  }>({
    isOpen: false,
    type: null
  });

  const openModal = (type: 'lead' | 'property' | 'task' | 'deal') => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  return {
    ...modalState,
    openModal,
    closeModal
  };
}

// Floating Action Button Component
export function GlobalFAB() {
  const { isOpen, type, openModal, closeModal } = useGlobalModals();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <GlobalModals isOpen={isOpen} type={type} onClose={closeModal} />
      
      {/* FAB Menu */}
      <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
        {showMenu && (
          <div className="absolute bottom-16 right-0 flex flex-col space-y-3 mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white bg-blue-600 px-3 py-1 rounded-full shadow-lg">Add Lead</span>
              <Button
                onClick={() => {
                  openModal('lead');
                  setShowMenu(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white bg-green-600 px-3 py-1 rounded-full shadow-lg">Add Property</span>
              <Button
                onClick={() => {
                  openModal('property');
                  setShowMenu(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white bg-purple-600 px-3 py-1 rounded-full shadow-lg">Add Task</span>
              <Button
                onClick={() => {
                  openModal('task');
                  setShowMenu(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white bg-amber-600 px-3 py-1 rounded-full shadow-lg">Add Deal</span>
              <Button
                onClick={() => {
                  openModal('deal');
                  setShowMenu(false);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
        
        <Button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-full w-14 h-14 p-0 transition-transform duration-200 hover:scale-110"
        >
          <Plus className={`w-6 h-6 transition-transform duration-200 ${showMenu ? 'rotate-45' : ''}`} />
        </Button>
      </div>
    </>
  );
}
