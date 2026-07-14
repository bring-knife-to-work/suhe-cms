<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="size"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    currentPage: number
    pageSize: number
    total: number
    pageSizes?: number[]
    layout?: string
    background?: boolean
  }>(),
  {
    pageSizes: () => [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
  }
)

const emit = defineEmits<{
  'update:currentPage': [number]
  'update:pageSize': [number]
  change: []
}>()

const page = computed({
  get: () => props.currentPage,
  set: (v: number) => emit('update:currentPage', v),
})

const size = computed({
  get: () => props.pageSize,
  set: (v: number) => emit('update:pageSize', v),
})

function onSizeChange() {
  emit('update:currentPage', 1)
  emit('change')
}

function onCurrentChange() {
  emit('change')
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
