import './documents.scss';
import ko from 'knockout';
import Sortable from 'sortablejs';
import documentsTemplate from './document.html';
import itemsListTemplate from './items-list.html';
import { ANIMATION_DURATION, PARENT_ID_ROOT } from "../../constants/documents.constant";
import { getDocumentsMockData } from "../../services/documents.service";


class DocumentsViewModel {
  constructor(params) {
    this.categories = ko.observableArray();
    this.fetchData();

    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.animateExpand = this.animateExpand.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);

    ko.bindingHandlers.sortableList = {
      init: (element, valueAccessor, allBindings, viewModel, bindingContext) => {
        const isCategory = allBindings.get('isCategory');
        let dropIndicator;

        const options = {
          group: isCategory ? {
            name: 'categories',
            put: false
          } : 'items',
          animation: ANIMATION_DURATION,
          handle: '.move-btn',
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          onStart: (evt) => {
            dropIndicator = document.createElement('li');
            dropIndicator.className = 'drop-indicator';
          },
          onEnd: (evt) => {
            if (dropIndicator && dropIndicator.parentNode) {
              dropIndicator.parentNode.removeChild(dropIndicator);
            }
            evt.from.classList.remove('sortable-placeholder');
            this.onMoveEnd(evt, isCategory);
          },
          onMove: (evt) => {
            if (!dropIndicator) return;
            const target = evt.related;
            const parent = target.parentNode;

            if (evt.willInsertAfter) {
              parent.insertBefore(dropIndicator, target.nextElementSibling);
            } else {
              parent.insertBefore(dropIndicator, target);
            }

            this.expandCategoryOnDrag(target);
          }
        };

        Sortable.create(element, options);
      }
    };
  }

  async fetchData() {
    const data = await getDocumentsMockData();
    this.processData(data);
  }

  processData(data) {
    const categories = data.filter(item => item.parentId === PARENT_ID_ROOT);
    categories.forEach(category => {
      const categoryItems = data.filter(item => item.parentId === category.id);
      this.categories.push({
        id: category.id,
        title: category.title,
        expanded: ko.observable(false),
        items: ko.observableArray(categoryItems)
      });
    });
  }
  animateExpand(categoryId, expand) {
    const element = document.querySelector(`[data-id="${categoryId}"] .items`);
    if (element) {
      if (expand) {
        element.classList.remove('collapsed');
        element.style.height = `${element.scrollHeight}px`;
        setTimeout(() => {
          element.style.height = 'auto';
        }, ANIMATION_DURATION);
      } else {
        element.style.height = `${element.scrollHeight}px`;
        setTimeout(() => {
          element.classList.add('collapsed');
          element.style.height = '0';
        }, 0);
      }
    }
  }

  toggleExpand(category) {
    const isExpanded = category.expanded();
    category.expanded(!isExpanded);
    this.animateExpand(category.id, isExpanded);
  }

  expandCategoryOnDrag(target) {
    const categoryElement = target.closest('.category');
    if (categoryElement) {
      const categoryId = parseInt(categoryElement.dataset.id);
      const category = this.categories().find(c => c.id === categoryId);
      if (category && !category.expanded()) {
        this.animateExpand(categoryId, true);
      }
    }
  }

  onMoveEnd(evt, isCategory) {
    const { from, to, item, oldIndex, newIndex } = evt;

    if (isCategory) {
      this.moveCategory(oldIndex, newIndex);
    } else {
      this.moveItem(from, to, item, oldIndex, newIndex);
    }

    this.categories.valueHasMutated();
  }

  moveCategory(oldIndex, newIndex) {
    const categories = this.categories();
    const movedCategory = categories.splice(oldIndex, 1)[0];
    categories.splice(newIndex, 0, movedCategory);
    this.categories(categories);
  }

  moveItem(from, to, item, oldIndex, newIndex) {
    const fromCategoryIndex = ko.contextFor(from).$index();
    const toCategoryIndex = ko.contextFor(to).$index();
    const movedItem = ko.dataFor(item);

    const fromCategory = this.categories()[fromCategoryIndex];
    const toCategory = this.categories()[toCategoryIndex];

    fromCategory.items.remove(movedItem);

    if (fromCategoryIndex === toCategoryIndex) {
      const items = toCategory.items();
      items.splice(newIndex, 0, movedItem);
    }
  }
}

class ItemsListViewModel {
  constructor(params) {
    this.items = params.items;
    this.expanded = params.expanded;
  }
}

ko.components.register('documents-component', {
  viewModel: DocumentsViewModel,
  template: documentsTemplate
});

ko.components.register('items-list-component', {
  viewModel: ItemsListViewModel,
  template: itemsListTemplate
});